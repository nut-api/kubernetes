# Client setup
```
brew install int128/kubelogin/kubelogin
```

Generate shared secrets between dex and kubectl
```
openssl rand -base64 32
```
Then put the secret on dex's `config.yaml` in configMaps

## kube-apiserver flags
For a cluster which created from Kubeadm, kube-apiserver flags can be add in `/etc/kubernetes/manifests/kube-apiserver.yaml`
```
--oidc-issuer-url=https://dex.vongjon.com/dex
--oidc-client-id=kubernetes
--oidc-username-claim=email
--oidc-groups-claim=groups
```

# Set up kubeconfig
```
 kubectl config set-credentials oidc \
    --exec-api-version=client.authentication.k8s.io/v1beta1 \
    --exec-command=kubectl \
    --exec-arg=oidc-login \
    --exec-arg=get-token \
    --exec-arg=--oidc-issuer-url=https://dex.vongjon.com/dex \
    --exec-arg=--oidc-client-id=kubernetes \
    --exec-arg=--oidc-client-secret=<SECRETS-YOUR-CREATED-ABOVE> \
    --exec-arg=--extra-scope=email \
    --exec-arg=--extra-scope=groups
```

## Create ClusterRoleBlinding for Cluster-admin groups in AD
```
kubectl create clusterrolebinding oidc-cluster-admin --clusterrole=cluster-admin --group="Staging Admins"
```

# this for user to setup oidc login.
<!-- 
kubectl oidc-login setup \
  --oidc-issuer-url=https://dex.vongjon.com/dex \
  --oidc-client-id=kubernetes \
  --oidc-client-secret=QjsEyjl+/gisYYjmBZj/952Axt3ByMB73j9PqTtyqMc=  \
  --oidc-extra-scope=email \
  --oidc-extra-scope=groups -->

# Add permission to authenticated user for view role
```
kubectl create clusterrolebinding oidc-cluster-user --clusterrole=view --group="system:authenticated"
```
