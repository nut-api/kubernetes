#!/bin/bash

couch_name=""
namespace="main"
replicas_count=3  # Default number of URLs to check
retry_count=3  # Default number of retries

# Function to generate a specific URL
generate_url() {
    local num=$1
    echo "${couch_name}-${num}.couchdb-cluster.${namespace}.svc.cluster.local:5984"
}

while getopts "n:r:t:" opt; do
  case $opt in
    n)
      namespace="$OPTARG"
      ;;
    r)
      replicas_count="$OPTARG"
      ;;
    t)
      retry_count="$OPTARG"
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      ;;
  esac
done
shift $((OPTIND-1))

# Get the common URL as a required argument
if [ "$#" -eq 0 ]; then
    echo "Usage: $0 [-n namespace] [-r replicas_count] [-t retry_count] couch_name"
    exit 1
else
    couch_name="$1"
fi

success=false
retry=0

while [ $retry -lt $retry_count ]; do
    sleep 5 # Add some delay

    for ((num=0; num<=(replicas_count-1); num++)); do
    url=$(generate_url $num)

        response=$(curl -s "$url/_cluster_setup" -X POST -H "Content-Type: application/json" -d '{"action": "finish_cluster"}' -u admin:$COUCHDB_PASSWORD)

        if [ "$response" == "{\"ok\":true}" ]; then
            echo "$url returned: $response"
            echo "Success! CouchDB cluster is now set up."
            success=true
            break
        else
            echo "$url returned: $response"
            sleep 1
        fi
    done

    if [ "$success" = true ]; then
        break
    fi
    retry=$((retry + 1))

done

if [ "$success" = false ]; then
    echo "None of the URLs returned success response after $retry_count retries."
fi
