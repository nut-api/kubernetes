#!/bin/bash

# This script is url with domain $DOMAIN from the Istio VirtualService
# and save them to a file called sites.txt
# Usage: ./get-site.sh [domain]
# Example: ./get-site.sh staging-host.site

# Commamd list urls
GET_ALL_URLS=$(kubectl get virtualservices.networking.istio.io -o json | jq '.items[].spec.hosts[]')
# Get the domain from the command line argument or use default
# Default domain
DOMAIN="staging-host.site"

# Overwrite $DOMAIN if  passed as argument
if [ -n "$1" ]; then
    DOMAIN=$1
fi

# Create empty file, empty the file if it exists
> ./sites.txt

# Loop through the urls
for url in $GET_ALL_URLS; do

    # If url have domain $DOMAIN
    if [[ $url == *"$DOMAIN"* ]]; then

        # Cut "" from the url
        url=$(echo $url | cut -d '"' -f 2)
        
        # Print the url to the file
        echo $url >> ./sites.txt

    fi
done