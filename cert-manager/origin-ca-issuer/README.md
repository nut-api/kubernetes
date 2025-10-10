## Installing Origin CA Issuer
First, we need to install the Custom Resource Definitions for the Origin CA Issuer.:

    kubectl apply -f deploy/crds
Then install the RBAC rules, which will allow the Origin CA Issuer to operate with OriginIssuer and CertificateRequest resources:

    kubectl apply -f deploy/rbac
Then install the controller, which will process Certificate Requests created by cert-manager.:

    kubectl apply -f deploy/manifests
By default the Origin CA Issuer will be deployed in the origin-ca-issuer namespace.
```bash
$ kubectl get -n origin-ca-issuer pod
NAME                                READY   STATUS      RESTARTS    AGE
pod/origin-ca-issuer-1234568-abcdw  1/1     Running     0           1m
```