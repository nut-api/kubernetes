# Install controller
```bash
kubectl create namespace argo-rollouts
kubectl apply -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml
```

# Argo cli plugin
```bash
# Kubectl plugin installation
brew install argoproj/tap/kubectl-argo-rollouts

# Get <app> rollout and watch progress
kubectl argo rollouts get rollout guestbook -w
```
# Install demo
```bash
# Install demo
kubectl apply -k .

# Edit color of the image to see canary deployment
kubectl edit deploy rollouts-demo
```
# Clean demo
```bash
# Clean demo
kubectl delete -k .
```