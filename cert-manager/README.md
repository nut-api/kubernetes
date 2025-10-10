# Installing with Helm

1. Add the Jetstack Helm repository

This repository is the only supported source of cert-manager charts. There are some other mirrors and copies across the internet, but those are entirely unofficial and could present a security risk.

Notably, the "Helm stable repository" version of cert-manager is deprecated and should not be used.:


        helm repo add jetstack https://charts.jetstack.io
2. Update your local Helm chart repository cache:

        helm repo update

3. Install cert-manager

To install the cert-manager Helm chart, use the Helm install command as described below.

```bash
helm install \
  cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --version v1.8.0 \
  --set installCRDs=true
```

# Cert-manager, Istio, Let's encrypt

> HTTP01 solver with let's encrypt cannot work with wildcard, using DNS01 togather with cloudflare instead.

Cert-manager cannot challenge new cert for domain due to routing confict between Istio's gateway and K8s's ingress which created by Cert-manager.
Certificate request cannot reach to challenges pod.

[ref.](https://github.com/cert-manager/cert-manager/issues/1636#issuecomment-721490874)

# All resources involved with cert-manager
```bash
v1/ClusterRole
v1/Deployment
v1/Pod(related)
v1/Service
v1/ServiceAccount
v1beta1/ClusterRole
v1beta1/ClusterRoleBinding
v1beta1/MutatingWebhookConfiguration ##
v1beta1/Role
v1beta1/RoleBinding
v1beta1/ValidatingWebhookConfiguration ##
```

# Mutation&Validation webhook on other namespaces failed

Cert-manager inject `caBundle` cert to validation and mutation webhook by `cainjector`.
With `--namespace` flag on cainjector make it limits to inject the cert to single namespace(normally cert-manager).
This this make webhook on other namespaces failed.
So, remove this flag on cainjector installation will make it work.
[CAinjector flags ref.](https://cert-manager.io/docs/cli/cainjector/)