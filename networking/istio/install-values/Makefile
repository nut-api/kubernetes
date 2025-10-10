install:
	helm upgrade istio-base istio/base --install --wait
	helm upgrade istiod istio/istiod -f values.yaml --install --wait
	helm upgrade istio-ingress istio/gateway --install --wait
	helm upgrade istio-ingressgateway istio/gateway --install --wait