K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9090/api/v1/write
K6_PROMETHEUS_RW_TREND_STATS=p(95),p(99),min,max

up:
	docker compose up -d
down:
	docker compose down -v

run:
	K6_PROMETHEUS_RW_SERVER_URL="http://localhost:9090/api/v1/write" K6_PROMETHEUS_RW_TREND_STATS="p(95),p(99),min,max" k6 run -o experimental-prometheus-rw script.js