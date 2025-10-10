# Monitoring

## Prometheus Stack

### Helm

### Install with local Chart
```bash
helm install [release-name] ./kube-prometheuse-stack -f values.yaml
```
### Install with remote Chart
**Get repo with helm**

``` shell
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
```

**Get value from helm chart**

``` shell
helm show values prometheus-community/kube-prometheus-stack >> values.yaml
```

**Installation with values file**

version currently in use is `35.0.0`

``` shell
helm install [release-name] prometheus-community/kube-prometheus-stack -f values.yaml --version 35.0.0

```

### Installing Custom Dashboard

NOTE: to get automatically discovered by sidecar you need to match the label specified in the values file

> e.g.  
> labels:  
> ---grafana_dashboard: "1" 

``` shell
kubectl apply -k dashboards
```

## Integrated AzureAD OAuth
[Configure Azure AD OAuth2 authentication.](https://grafana.com/docs/grafana/latest/setup-grafana/configure-security/configure-authentication/azuread/)
### Config
`values.yaml`
```bash
  grafana.ini:
    paths:
      data: /var/lib/grafana/
      logs: /var/log/grafana
      plugins: /var/lib/grafana/plugins
      provisioning: /etc/grafana/provisioning
    analytics:
      check_for_updates: true
    log:
      mode: console
    grafana_net:
      url: https://grafana.net
    server:
      root_url: https://grafana.vongjon.com
    auth.azuread:
      name: Azure AD
      enabled: true
      allow_sign_up: true
      auto_login: false
      # client_id: <Using Vault>
      # client_secret: <Using Vault>
      scopes: openid email profile
      auth_url: https://login.microsoftonline.com/b113961f-7d2b-4e69-b9a7-e4473fc1d8a4/oauth2/v2.0/authorize
      token_url: https://login.microsoftonline.com/b113961f-7d2b-4e69-b9a7-e4473fc1d8a4/oauth2/v2.0/token
      allowed_domains: apiplustech.com
      # allowed_groups:
      role_attribute_strict: false
      allow_assign_grafana_admin: true
      skip_org_role_sync: true
```

### Add AzureAD secrets to Vault
#### Add secrets
`command in Vault`
```bash
## Add read permission for grafana
cat <<EOF > /home/vault/app-monitoring-policy.hcl
path "secret/data/monitoring" {
  capabilities = ["read"]
}
EOF

vault policy write read-monitoring /home/vault/app-monitoring-policy.hcl

vault write auth/kubernetes/role/monitoring \
   bound_service_account_names=monitoring-grafana \
   bound_service_account_namespaces=monitoring \
   policies=read-monitoring \
   ttl=1h

## Add secrets
vault kv put -mount=secret monitoring GF_AUTH_AZUREAD_CLIENT_ID=<value-1> #In k/v v2, with -mount=secret, secrets are in secret/data/monitoring (matched with the policy)
# Put others key
vault kv patch -mount=secret monitoring GF_AUTH_AZUREAD_CLIENT_SECRET=<value-2>

# Check keys
vault kv get -mount=secret monitoring

```

## To use values in vault
Add annotation to trigger vault injector to inject secrets to pod.
```yaml
# Pod template
metadata:
  annotations:
    vault.hashicorp.com/agent-inject: 'true'
    vault.hashicorp.com/agent-inject-status: 'update'
    vault.hashicorp.com/role: "monitoring" #k8s role
    vault.hashicorp.com/agent-inject-secret-config: 'secret/data/monitoring' # Secret location
    vault.hashicorp.com/agent-inject-template-config: |
      {{ with secret "secret/data/monitoring" -}}
        export GF_AUTH_AZUREAD_CLIENT_ID={{ .Data.data.GF_AUTH_AZUREAD_CLIENT_ID }}
        export GF_AUTH_AZUREAD_CLIENT_SECRET={{ .Data.data.GF_AUTH_AZUREAD_CLIENT_SECRET }}
      {{- end }}
    traffic.sidecar.istio.io/excludeOutboundPorts: "8200"
```
Use the secrets with command
```yaml
  command:
  - "sh"
  - "-c"
  - "source /vault/secrets/config && /run.sh"
```

# Node setup

Get metrics from `etcd` which start by `kubeadm`

If you're using kubeadm, it has already configured etcd with --listen-metrics-urls, which does not require certificates, and is just plain HTTP.

... Unfortunately by default it's probably listening on `127.0.0.1:2381`. To remedy that you need to ensure your `ClusterConfiguration` includes something like this:

```yaml
kind: ClusterConfiguration
etcd:
  local:
    extraArgs:
      listen-metrics-urls: http://0.0.0.0:2381
```

If you've already provisioned your cluster, you'll need to monkey-patch that in with a `kubectl edit -n kube-system cm/kubeadm-config`, and then run `kubeadm upgrade` node on each control plane node that is hosting etcd.

Then you need to update your kube-prometheus-stack Helm values to include this:
```yaml
kubeEtcd:
  service:
    port: 2381
    targetPort: 2381
```
[Ref](https://github.com/prometheus-community/helm-charts/issues/204#issuecomment-1003558431)

To get `controller-manager` and `scheduler` metrics.
This is because Prometheus is monitoring wrong endpoints of those targets and/or targets don't expose metrics endpoint.

Take `controller-manager` for example:
```bash
sudo vi /etc/kubernetes/manifests/kube-controller-manager.yaml
apiVersion: v1
kind: Pod
metadata:
  ...
spec:
  containers:
  - command:
    - kube-controller-manager
    ...
    - --bind-address=<your control-plane IP or 0.0.0.0>
    ...
```
Edit this `bind-address` on each control plane node.

##  Cannot evaluate kubelet rules, many-to-many matching not allowed 
You can fix this by deleting the `kube-prometheus-stack-kubelet`(the old one which duplicated) service in the `kube-system` namespace.

Still seeing this error almost 3 years later. Is there a more permanent fix? Seems like we shouldn't have to go delete the service after every stack update.
[ref](https://github.com/prometheus-community/helm-charts/issues/635)