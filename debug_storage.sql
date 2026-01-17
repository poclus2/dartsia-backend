-- 1. Check raw settings for a few random active hosts to see the values
SELECT "publicKey", "settings"->>'totalstorage' as raw_total, "settings"->>'remainingstorage' as raw_remaining, "lastSeen"
FROM hosts
WHERE "lastSeen" > NOW() - INTERVAL '24 hours'
LIMIT 5;

-- 2. Sum for ACTIVE hosts (current logic)
SELECT 
    COUNT(*) as active_count,
    SUM(("settings"->>'totalstorage')::numeric) as active_total_bytes,
    SUM(("settings"->>'totalstorage')::numeric) / 1000000000000000 as active_total_pb
FROM hosts
WHERE "lastSeen" > NOW() - INTERVAL '24 hours';

-- 3. Sum for ALL hosts (to see potential max)
SELECT 
    COUNT(*) as total_count,
    SUM(("settings"->>'totalstorage')::numeric) as all_total_bytes,
    SUM(("settings"->>'totalstorage')::numeric) / 1000000000000000 as all_total_pb
FROM hosts;

-- 4. Check top 5 hosts by storage size (active)
SELECT "publicKey", ("settings"->>'totalstorage')::numeric / 1000000000000 as total_tb
FROM hosts
WHERE "lastSeen" > NOW() - INTERVAL '24 hours'
ORDER BY ("settings"->>'totalstorage')::numeric DESC NULLS LAST
LIMIT 5;
