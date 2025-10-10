# Installation With Helm
You can install MetallLB with Helm by using the Helm chart repository: https://metallb.github.io/metallb
```bash
helm repo add metallb https://metallb.github.io/metallb
helm install metallb metallb/metallb -n metallb-system --create-namespace
```

apply `addr-pool` and `advertisement` for assign ip to service