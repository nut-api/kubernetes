[Quickstarts](https://strimzi.io/quickstarts/)
[article-about-production-environment](https://blog.devgenius.io/kafka-on-kubernetes-using-strimzi-part-3-configuration-options-f8aa027e9ba0)

## Installation with helm

Add the Strimzi Helm repository and update the local index.
```bash
helm repo add strimzi https://strimzi.io/charts/
helm repo update
```

Install the latest version of Strimzi
```bash
helm install strimzi strimzi/strimzi-kafka-operator
```