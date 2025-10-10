# DNS Debugging
```bash
kubectl apply -f ./dnsutils.yaml
pod/dnsutils created
```
…and verify its status:
```bash
kubectl get pods dnsutils
NAME      READY     STATUS    RESTARTS   AGE
dnsutils   1/1       Running   0          <some-time>
```
Once that Pod is running, you can exec nslookup in that environment. If you see something like the following, DNS is working correctly.
```bash
kubectl exec -i -t dnsutils -- nslookup kubernetes.default

Server:    10.0.0.10
Address 1: 10.0.0.10

Name:      kubernetes.default
Add
ress 1: 10.0.0.1
```