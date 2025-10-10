#!/bin/bash
# Usage: ./gen.sh <secret-name> [hydra(option]

DATABASE_URI=$PG_URI

if [ "$2" == "hydra" ]; then
    # Change syntax for hydra
    DATABASE_URI=`echo $PG_URI | sed 's/postgresql\:/postgres\:/g'`
fi
# Check exist option.
CHECK=$(echo $DATABASE_URI | grep "?")


# Add DSN option.
if [ "$CHECK" ]; then
    MOD_URI=$DATABASE_URI\&max_conn_idle_time=1h\&max_conn_lifetime=1h
else
    MOD_URI=$DATABASE_URI\?max_conn_idle_time=1h\&max_conn_lifetime=1h
fi

# Delete old secret if exist
kubectl delete secret $1
# Create a new one with max_conn_lifetime&max_conn_idle_time
kubectl create secret generic $1 --from-literal=uri=$MOD_URI