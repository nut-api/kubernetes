start:
	docker run --rm \
	-v /Volumes/workspace/kubernetes/bunnycdn/config.yaml:/etc/otelcol-contrib/config.yaml \
	-v /Volumes/workspace/kubernetes/bunnycdn/sample.log:/tmp/sample.log \
	ghcr.io/open-telemetry/opentelemetry-collector-releases/opentelemetry-collector-contrib:0.124.0

up:
	docker compose up -d

down: 
	docker compose down
