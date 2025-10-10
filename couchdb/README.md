To finish setup cluster
```bash
kubectl exec --namespace couchdb -it db-couch-0 -c db-couch -- \
    curl -s http://127.0.0.1:5984/_cluster_setup -X POST -H "Content-Type: application/json" -d '{"action": "finish_cluster"}' -u admin:$COUCHDB_PASSWORD
```

## Replicating
Today I would like to share about how easy to setup Master-master replication in CouchDB. One of CouchDB's strengths is the ability to synchronize two copies of the same database. We can trigger a replication process by sending a JSON object either to the /_replicate api endpoint or storing it as a document into the _replicator database.

Let say we have a database called cars in Server A and we would like to to replicate the cars database to Server B.
```bash
POST /_replicate

{
   "create_target": false,
   "continuous": false,
   "source": {
      "url": "http://SERVER_A_HOSTNAME:5984/cars",
      "headers": {
         "Authorization": "YOUR_SERVER_A_CREDENTIAL"
      }
   },
   "target": {
      "url": "http://SERVER_B_HOSTNAME:5984/cars",
      "headers": {
         "Authorization": "YOUR_SERVER_B_CREDENTIAL" #"Authorization: Basic $b64encoded_username_and_password"
      }
   }
}
```
If the database doesn't exist in the target CouchDB server, we can set the `create_target` property to `true`, it will helps us to create a new database and start replicate the data from the source database. For Master-master replication setup, we would like to setup a long running replication instead of one time off, just set the `continuous` property to `true`.

```bash
POST /_replicator

{
   "create_target": false,
   "continuous": true,
   "source": {
      "url": "http://SERVER_A_HOSTNAME:5984/cars",
      "headers": {
         "Authorization": "YOUR_SERVER_A_CREDENTIAL"
      }
   },
   "target": {
      "url": "http://SERVER_B_HOSTNAME:5984/cars",
      "headers": {
         "Authorization": "YOUR_SERVER_B_CREDENTIAL"
      }
   }
}
```

For startup.sh
```bash
./startup.sh -n "{{ $.Release.Namespace }}" -r 3 -t 3 db-couch
```

For dump.sh
```bash
usage() {
  echo "Usage: $0 [-d | -r] [-h COUCHDB_URL] [-b S3_BUCKET]"
  echo "Options:"
  echo "  -d              Dump CouchDB databases and upload to S3"
  echo "  -r              Restore CouchDB databases from S3"
  echo "  -h COUCHDB_URL  Specify CouchDB server URL (default: $COUCHDB_URL)"
  echo "  -b S3_BUCKET    Specify AWS S3 bucket name (default: $S3_BUCKET)"
  exit 1
}

# Example: Dump from `main` namespace to `couchdb` namespace.
# Dump & Upload
./dump.sh -d -h "db-couch.main.svc.cluster.local:5984" -b "test-couchdb"
# Download & Restore
./dump.sh -r -h "db-couch.couchdb.svc.cluster.local:5984" -b "test-couchdb"

```