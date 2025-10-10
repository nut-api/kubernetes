CREATE TABLE IF NOT EXISTS otel_logs
(
        `Timestamp` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
        `TraceId` String CODEC(ZSTD(1)),
        `SpanId` String CODEC(ZSTD(1)),
        `TraceFlags` UInt32 CODEC(ZSTD(1)),
        `SeverityText` LowCardinality(String) CODEC(ZSTD(1)),
        `SeverityNumber` Int32 CODEC(ZSTD(1)),
        `ServiceName` LowCardinality(String) CODEC(ZSTD(1)),
        `Body` String CODEC(ZSTD(1)),
        `ResourceSchemaUrl` String CODEC(ZSTD(1)),
        `ResourceAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `ScopeSchemaUrl` String CODEC(ZSTD(1)),
        `ScopeName` String CODEC(ZSTD(1)),
        `ScopeVersion` String CODEC(ZSTD(1)),
        `ScopeAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `LogAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1))
) 
ENGINE = Null;

CREATE TABLE IF NOT EXISTS otel_logs_v2
(
        `Body` String,
        `Timestamp` DateTime,
        `ServiceName` String,
        `CacheStatus` String,
        `StatusCode` UInt16,
        `BytesSent` UInt32,
        `PullZoneId` String,
        `RemoteIp` IPv4,
        `RefererUrl` String,
        `Url` String,
        `EdgeLocation` String,
        `UserAgent` String,
        `UniqueRequestId` String,
        `CountryCode` String,
        `SeverityText` String,
        `SeverityNumber` UInt8,
        `CountReqs` UInt32 DEFAULT 1,
        `SumSentBytes` UInt64 DEFAULT BytesSent
)
ENGINE = MergeTree
PARTITION BY toStartOfMonth(Timestamp)
ORDER BY (Url, RefererUrl, toStartOfDay(Timestamp), Timestamp)
TTL Timestamp + INTERVAL 3 MONTH
    GROUP BY Url, RefererUrl, toStartOfDay(Timestamp)
    SET 
        CountReqs = sum(CountReqs),
        SumSentBytes = sum(SumSentBytes),
    Timestamp + INTERVAL 3 MONTH TO VOLUME 's3'
SETTINGS storage_policy = 'local_s3';



CREATE MATERIALIZED VIEW IF NOT EXISTS otel_logs_mv TO otel_logs_v2 AS
SELECT
        Body, 
        Timestamp::DateTime AS Timestamp,
        LogAttributes['hostname'] AS ServiceName,
        LogAttributes['cache_status'] AS CacheStatus,
        LogAttributes['status_code'] AS StatusCode,
        LogAttributes['bytes_sent'] AS BytesSent,
        LogAttributes['pull_zone_id'] AS PullZoneId,
        LogAttributes['remote_ip'] AS RemoteIp,
        LogAttributes['referer_url'] AS RefererUrl,
        LogAttributes['url'] AS Url,
        LogAttributes['edge_location'] AS EdgeLocation,
        LogAttributes['user_agent'] AS UserAgent,
        LogAttributes['unique_request_id'] AS UniqueRequestId,
        LogAttributes['country_code'] AS CountryCode,
        SeverityText,
        SeverityNumber
FROM otel_logs;

-- CREATE TABLE bytes_per_url_hour
-- (
--   `Hour` DateTime,
--   `Url` String,
--   `TotalBytes` UInt64
-- )
-- ENGINE = SummingMergeTree -- sum by order keys.
-- ORDER BY (Hour, Url)
-- SETTINGS storage_policy = 's3';

-- CREATE MATERIALIZED VIEW bytes_per_url_hour_mv TO bytes_per_url_hour AS
-- SELECT
--     toStartOfHour(Timestamp) AS Hour,
--     LogAttributes['url'] AS Url,
--     sum(toUInt64OrDefault(LogAttributes['bytes_sent'])) AS TotalBytes
-- FROM otel_logs
-- GROUP BY Hour, Url