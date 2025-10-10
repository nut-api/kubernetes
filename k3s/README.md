```bash
# install k3s
curl -sfL https://get.k3s.io |  INSTALL_K3S_EXEC="--disable=traefik" sh -s -

# install istio
kubectl create namespace istio-system
helm install istio-base istio/base -n istio-system --wait
helm install istiod istio/istiod -n istio-system --wait
kubectl label namespace istio-system istio-injection=enabled
helm install istio-ingressgateway istio/gateway -n istio-system --wait

# open 80 port
kubectl apply -f gateway.yaml

# test service
kubectl apply -k github.com/stefanprodan/podinfo//kustomize
kubectl apply -f routing.yaml

# clean test service
kubectl delete -k github.com/stefanprodan/podinfo//kustomize
kubectl delete -f routing.yaml
```