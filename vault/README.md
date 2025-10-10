# Installation
## Add helm charts repo
Add hashicorp helm charts.
``` bash
helm repo add hashicorp https://helm.releases.hashicorp.com
helm repo update
```
## Install the Consul&Vault
Consul is a service mesh solution that launches with a key-value store. Vault requires a storage backend like Consul to manage its configuration and secrets when it is run in high-availability.
``` bash
helm install consul hashicorp/consul --values helm-consul-values.yaml
helm install vault hashicorp/vault --values helm-vault-values.yaml
```
## Initialize and unseal Vault
Initialize Vault with one key share and one key threshold.
``` bash
kubectl exec vault-0 -- vault operator init -key-shares=1 -key-threshold=1
```
this will show vault's key for unseal the vault.
Unseal Vault running on all the vault pod.
``` bash
kubectl exec vault-0 -- vault operator unseal $VAULT_UNSEAL_KEY
```

