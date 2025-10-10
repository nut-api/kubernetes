#!/bin/bash
# Function to display usage information
usage() {
  echo "Usage: $0 [-d | -r]"
  echo "Options:"
  echo "  -d                  Dump CouchDB databases and upload to S3"
  echo "  -r                  Restore CouchDB databases from S3"
  exit 1
}

# Set the CouchDB server URL
# Check if the environment variable is set
if [ -z "$COUCHDB_URL" ]; then
    # If not set, use the default value
    DEFAULT_COUCHDB_URL="db-couch.main.svc.cluster.local:5984"
    COUCHDB_URL="$DEFAULT_COUCHDB_URL"
fi


# Set the AWS S3 Endpoint URL
if [ -z "$AWS_ENDPOINT_URL" ]; then
    DEFAULT_S3_ENDPOINT_URL="https://s3.us-west-004.backblazeb2.com"
    AWS_ENDPOINT_URL="$DEFAULT_S3_ENDPOINT_URL"
fi


# Set the AWS S3 bucket name
if [ -z "$S3_BUCKET" ]; then
    DEFAULT_S3_BUCKET="couchdb-bucket"
    S3_BUCKET="$DEFAULT_S3_BUCKET"
fi

# Directory to store the dumped databases
DUMP_DIR="/tmp/couchdb_dump"

# Directory to store the restored databases
RESTORE_DIR="/tmp/couchdb_restore"

# Parse command-line options
while getopts "drh:b:" opt; do
  case $opt in
    d)
      action="dump"
      ;;
    r)
      action="restore"
      ;;
    *)
      usage
      ;;
  esac
done

# Ensure the dump directory exists
mkdir -p $DUMP_DIR

# Ensure the resotre directory exists
mkdir -p $RESTORE_DIR

# Function to dump a CouchDB database
dump_database() {
  local db_name="$1"
  echo "Dumping database: $db_name"
  bash couchdb-dump.sh -b -q -H $COUCHDB_URL -d $db_name -f $DUMP_DIR/$db_name.json -u $COUCHDB_USER -p $COUCHDB_PASSWORD
}

# Function to restore a CouchDB database
restore_database() {
  local db_name="$1"
  echo "Restoring database: $db_name"
  bash couchdb-dump.sh -r -q -c -H $COUCHDB_URL -d $db_name -f $RESTORE_DIR/$db_name.json -u $COUCHDB_USER -p $COUCHDB_PASSWORD
}

# Get all databases name
for i in $(curl -s -X GET http://$COUCHDB_USER:$COUCHDB_PASSWORD@$COUCHDB_URL/_all_dbs); do \
         i=${i//[/}; i=${i//]/}; i=${i//\"/}
         IFS=, read -ra dbname <<< "$i"
done

# Dump or restore based on the selected action
if [ "$action" == "dump" ]; then
  # Dump all databases
  for db in "${dbname[@]}"; do \
      dump_database $db
  done
  # Remove local couchdb's user database.
  rm  $DUMP_DIR/_users.json

  # Upload
  aws s3 cp $DUMP_DIR s3://$S3_BUCKET --recursive --endpoint-url=$AWS_ENDPOINT_URL

  echo "CouchDB databases dumped and uploaded to S3."

elif [ "$action" == "restore" ]; then
  # Download
  aws s3 cp s3://$S3_BUCKET $RESTORE_DIR --recursive --endpoint-url=$AWS_ENDPOINT_URL

  # Restore all databases
  for file in $(ls $RESTORE_DIR); do \
      db=$(basename "$file" .json)
      restore_database $db
  done
  echo "CouchDB databases restored from S3."
else
  usage
fi
