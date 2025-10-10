# Configuration
[Ref](https://kubernetes.io/docs/tasks/administer-cluster/nodelocaldns/)
or
Using `nodelocaldns.yaml`
```bash
kubectl apply -f nodelocaldns.yaml
```

# Test
```bash
# Deploy testing pod
kubectl apply -f https://raw.githubusercontent.com/guessi/kubernetes-dnsperf/master/bench/k8s-dnsperf-bench.yaml
configmap/dns-records-config created
deployment.apps/dnsperf created

# Get Kubernetes DNS service IP
kubectl get service kube-dns -n kube-system -o jsonpath='{$.spec.clusterIP}'

# Edit testing pod on`DNS_SERVER_ADDR` to the address
kubectl edit deployment dnsperf

# Clean testing pod
kubectl delete -f https://raw.githubusercontent.com/guessi/kubernetes-dnsperf/master/bench/k8s-dnsperf-bench.yaml

```
# Performance
## Before
```bash
# Testing resaul
DNS Performance Testing Tool
Version 2.13.1

[Status] Command line: dnsperf -f any -m udp -s 10.96.0.10 -p 53 -d /opt/records.txt -c 1 -T 1 -l 30 -t 5 -Q 100000
[Status] Sending queries (to 10.96.0.10:53)
[Status] Started at: Wed Apr  3 10:11:13 2024
[Status] Stopping after 30.000000 seconds
[Status] Testing complete (time limit)

Statistics:

  Queries sent:         313994
  Queries completed:    313994 (100.00%)
  Queries lost:         0 (0.00%)

  Response codes:       NOERROR 313994 (100.00%)
  Average packet size:  request 43, response 165
  Run time (s):         30.009114
  Queries per second:   10463.287920

  Average Latency (s):  0.009485 (min 0.000084, max 0.062343)
  Latency StdDev (s):   0.005177
---
# resource consumtion
NAME                               CPU(cores)   MEMORY(bytes)   
coredns-7b6dc7894d-hdl28           856m         24Mi            
coredns-7b6dc7894d-wd4wh           972m         27Mi            
.
.
.
```
## After
```bash
DNS Performance Testing Tool
Version 2.13.1

[Status] Command line: dnsperf -f any -m udp -s 10.96.0.10 -p 53 -d /opt/records.txt -c 1 -T 1 -l 30 -t 5 -Q 100000
[Status] Sending queries (to 10.96.0.10:53)
[Status] Started at: Wed Apr  3 10:27:53 2024
[Status] Stopping after 30.000000 seconds
[Status] Testing complete (time limit)

Statistics:

  Queries sent:         426555
  Queries completed:    426555 (100.00%)
  Queries lost:         0 (0.00%)

  Response codes:       NOERROR 426555 (100.00%)
  Average packet size:  request 43, response 160
  Run time (s):         30.006107
  Queries per second:   14215.606176

  Average Latency (s):  0.007002 (min 0.000066, max 0.055998)
  Latency StdDev (s):   0.003085
---
NAME                               CPU(cores)   MEMORY(bytes)   
coredns-7b6dc7894d-hdl28           3m           31Mi            
coredns-7b6dc7894d-wd4wh           4m           33Mi            
.
.
.
node-local-dns-bpm6p               3m           13Mi            
node-local-dns-dwhdv               3m           13Mi            
node-local-dns-j8m2h               3m           24Mi            
node-local-dns-l7h78               5m           24Mi            
node-local-dns-lqg8m               3m           13Mi            
node-local-dns-xdz2p               1696m        26Mi  
# The DNS query really go to local dns
```