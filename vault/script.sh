#!/bin/bash

printf "Unsesal Vaults\n"
read -sp 'Unseal Key(Hidden): ' KEY
kubectl exec vault-0 -n vault -- vault operator unseal $KEY
kubectl exec vault-1 -n vault -- vault operator unseal $KEY
kubectl exec vault-2 -n vault -- vault operator unseal $KEY
# kubectl exec vault-0 -n vault -- vault login $KEY
# kubectl exec vault-1 -n vault -- vault login $KEY
# kubectl exec vault-2 -n vault -- vault login $KEY