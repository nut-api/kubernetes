Login with the root token when prompted.
``` bash
kubectl -n vault exec -it vault-0 sh
vault login
```
# Configure Kubernetes authentication
``` bash
vault auth enable kubernetes

vault write auth/kubernetes/config \
    kubernetes_host=https://$KUBERNETES_SERVICE_HOST:$KUBERNETES_SERVICE_PORT

# ref for auth config (https://developer.hashicorp.com/vault/docs/auth/kubernetes#kubernetes-1-21)
```
# Vault wiht K/V
## Configure K/V authentication
## Configure Postgresql authentication
```bash
# `kv` secrets engine can be enabled by:
vault secrets enable -version=2 -path=secret kv

# ACL rule to give permission to access secrets in `secret/data/production/*`
cat <<EOF > /home/vault/app-policy.hcl
path "secret/data/production" {
  capabilities = ["read"]
}
EOF

vault policy write read-production /home/vault/app-policy.hcl # read-production is a name of the policy.

# Attach policy to application service account
vault write auth/kubernetes/role/production \
   bound_service_account_names=production \
   bound_service_account_namespaces=main \
   policies=read-production \
   ttl=1h
# k8s role: production
# service account name
# namespace
# policiy that created above
```
## Put K/V to vault
```bash
# Put first key
vault kv put -mount=secret production <key-1>=<value-1> #In k/v v2, with -mount=secret, secrets are in secret/data/production (matched with the policy)
# Put others key
vault kv patch -mount=secret production <key-2>=<value-2>

# Get exist key
vault kv get -mount=secret production
```
## To use values in vault
Add annotation to trigger vault injector to inject secrets to pod.
```yaml
# Pod template
metadata:
  annotations:
    vault.hashicorp.com/agent-inject: 'true'
    vault.hashicorp.com/agent-inject-status: 'update'
    vault.hashicorp.com/role: "production" #k8s role
    vault.hashicorp.com/agent-inject-secret-config: 'secret/data/production' # Secret location
    vault.hashicorp.com/agent-inject-template-config: |
      {{ with secret "secret/data/production" -}}
        export KEY_2={{ .Data.data.<key-1> }}
        export KEY_2={{ .Data.data.<key-2> }}
      {{- end }}
    # For helm
    # {{`{{ with secret "secret/data/production" -}}
    #   export KEY_2={{ .Data.data.<key-1> }}
    #   export KEY_2={{ .Data.data.<key-2> }}
    # {{- end }}`}}
    traffic.sidecar.istio.io/excludeOutboundPorts: "8200"
```
# Vault with Postgresql
``` bash
vault secrets enable database

vault write database/config/postgresdb \
    plugin_name=postgresql-database-plugin \
    allowed_roles="sql-role" \
    connection_url="postgresql://{{username}}:{{password}}@oauth-primary.default.svc:5432/oauth" \
    username="<your-db-user>" \
    password="<your-db-password>"
```
## Policy for dynamic postgresql user
``` bash
# Create role for database.
 vault write database/roles/sql-role \
    db_name=postgresdb \
    creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; \
        GRANT SELECT ON ALL TABLES IN SCHEMA public TO \"{{name}}\";" \
    default_ttl="1h" \
    max_ttl="24h"

# test
vault read database/creds/sql-role

# Config policy to read role.
cat <<EOF > /home/vault/postgres-app-policy.hcl
path "database/creds/sql-role" {
  capabilities = ["read"]
}
EOF

vault policy write postgres-app-policy /home/vault/postgres-app-policy.hcl

# Bind policy for kubernetes service account to use database from role.
vault write auth/kubernetes/role/sql-role \
   bound_service_account_names=dynamic-postgres \
   bound_service_account_namespaces=default \
   policies=postgres-app-policy \
   ttl=1h
```