# Install ArgoCD
```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```
## Installing with helm 
This method requrie helm version at least 3.11
```bash
helm repo add argo https://argoproj.github.io/argo-helm
helm install argocd argo/argo-cd -f values.yaml
```

## Access via port-forward
```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```
## Service Type load balancer
```bash
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "LoadBalancer"}}'
```

## Get password
```bash
# with `admin` username
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d; echo
```

# Integrate with AzureAD
[Offical docs](https://argo-cd.readthedocs.io/en/stable/operator-manual/user-management/microsoft/#azure-ad-app-registration-auth-using-oidc)