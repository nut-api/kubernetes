#!/bin/bash
kubectl create secret generic cloudflare --from-literal=dns-token=<cloudflare-key>