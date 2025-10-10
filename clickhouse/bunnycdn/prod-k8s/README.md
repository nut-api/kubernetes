```
kubectl create cm clickhouse-config --from-file=./bunnycdn/meterialized-views/clickhouse-s3.xml

helm install clickhouse bitnami/clickhouse -f values.yaml

# Access the clickhouse and create otel_logs tables


```