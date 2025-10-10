# Kubernetes
Kubernetes is used for deploying applications. This section will tell you how to install Kubernetes and create a cluster.

> Assumption
> - Assume that you have a VM to deploy the application, whether it be on cloud, or bare metal.
> - You should have at lease 4-6 VMs. 3 VMs for master nodes for HA (High-Availability), and at least 1 VM for the worker node.
> - You should have a permission to access your VM, we recommend to access your VM via ssh-key.(`ssh-copy-id <user>@<host>`)

## Environment preparation

We use Ansible to install kubeadm and create a cluster with 3 master nodes.

Ansible is configured using [`apipluspower/kubernetes`](https://github.com/apipluspower) repository. This repository contains everything you need to install and create a kubernetes cluster.

Tree for ansible config:

```bash
ansible-kube
├── ansible.cfg
├── inventory
│   ├── cluster
│   └── group_vars
│       └── cluster
│           └── all
├── playbooks
│   ├── install-all.yaml
│   .
```

In this tree, there are 2 files you have to configure.

1. `ansible-kube/inventory/cluster`
   It contains information about your VM, masters and workers IP.
   ```
   [k8s_master_primary]
    <host-master1-ip> ansible_user=<host-user>

    [k8s_master_replicas]
    <host-master2-ip> ansible_user=<host-user>
    <host-master3-ip> ansible_user=<host-user>
    .
    .
    .
    [k8s_workers]
    <host-worker1-ip> ansible_user=<host-user>
    <host-worker2-ip> ansible_user=<host-user>
    <host-worker3-ip> ansible_user=<host-user>
   ```
    Change `<host-mastern-ip` and `<host-workern-ip>` to the corresponding machine's ip addresses.
    Change `<host-user>` to the corresponding machine's user.

2. `ansible-kube/inventory/group_vars/cluster/all`
   It contains information about your cluster such as docker version.
   ```yaml
   docker_version: 20.10.14
   kubernetes_version: v1.24.0
   kubeadm_version: 1.24.0-00

   vip_address: <control-plane-ip>
   vip_interface: eth0
   ```
   The important part in this file are `vip_address` and `vip_interface`.
   When you create a cluster with multi master nodes(HA), it will have multiple IPs for master nodes, so you have to create virtual-ip to control them all with a single IP.
   - `vip_address` is an IP of the control-plane, set it to whatever IP you want for the control plane.
   - `vip_interface` is a interface that your VM connect to the network. In many Linux distributions, this can be found with the `ip a` command.

## Install a highly available kubernetes
You can now run `install-all.yaml` playbook to get your cluster setup:

    ansible-playbook -i inventory/cluster playbooks/install-all.yaml

Waiting for ansible to install and create cluster to complete, and now your have your kubernetes cluster running.
**What install-all includes:**
- Adding the required apt repositories
- Installing docker
- Installing kubeadm, kubelet and kubectl
- Initializing the first master with etcd and kubernetes-api
- Installing calico for container network interface
- Join replica master nodes to the primary master
- Adding the worker nodes to the cluster

## Access cluster
kubectl use `~/.kube/config` which store in primary master node to access cluster, copy configuration to your machine:

    scp <host-user>@<primary-master-ip>:/etc/kubernetes/admin.conf ~/.kube/config
now you can access your cluster, check your cluster is ready by following command:

    kubectl get node

# Configuration to use HAProxy(Opnsense) for load-balance control-plane instead of kube-vip.

1) Make a VIP as the load balancer under Interfaces-Virtual IPs (IP alias)
2) In Services-haproxy-Real Servers set up your real servers as the actual control plane nodes- IP, port, and do not check SSL
3) Go to Rules and Checks and make a healthcheck- http, GET, healthz, HTTP1.1 version, and the FQDN of your VIP host (load balancer FQDN). Do click "Force SSL" as you need that for the check.
3) Click on virtual services and make your backend pool comprising those nodes from above. TCP, Source-IP hash seems fine, your servers, enable health checking and select your check you just made, and set stick table persistence to source-ip.
4) Click virtual services dropdown arrow and then Public Service. This is the frontend. Select your listen addresses (VIP FQDN and IP), TCP, select the backend pool you just made. I didn't do anything else to this.
5) Settings-Service. Save and test the syntax and check the boxes to enable haproxy and then hit apply.