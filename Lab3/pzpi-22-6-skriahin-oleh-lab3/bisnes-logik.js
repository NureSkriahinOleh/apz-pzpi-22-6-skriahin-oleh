async function fetchAllLogs(sensors) {
    const rawLogs = {};
    await Promise.all(
        sensors.map(async ({ id }) => {
            const res = await axios.get(`/api/v1/sensor/sensors/${id}/logs/`);
            rawLogs[id] = res.data.map(l => ({
                timestamp: l.timestamp,
                raw: l.value,
            }));
        })
    );
    return rawLogs;
}

function computeMetrics(entries) {
    const vals = entries.map(e => Number(e.raw));
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length || 0;
    const variance = vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length || 0;
    const stdDev = Math.sqrt(variance);
    return { mean, stdDev, fdi: mean ? stdDev / mean : 0 };
}

function handleNewLog(prevLogs, newLog, computeMetricsFn) {
    const { sensor_id, raw, timestamp, location } = newLog;
    const arr = prevLogs[sensor_id] || [];
    const updated = [...arr, { timestamp, raw }];
    const { fdi } = computeMetricsFn(updated);
    return {
        logsBySensor: { ...prevLogs, [sensor_id]: updated },
        fdiByRoom: { [location]: fdi },
    };
}

function buildChartData(logsBySensor, sensors, unitConverter) {
    const rooms = {};

    sensors.forEach(({ id, location, sensor_type }) => {
        (rooms[location] = rooms[location] || { timestamps: new Set(), sensors: [] })
            .sensors.push({ id, type: sensor_type.type });
        (logsBySensor[id] || []).forEach(l => rooms[location].timestamps.add(l.timestamp));
    });

    const chartData = {};
    for (const [room, { timestamps, sensors: roomSensors }] of Object.entries(rooms)) {
        chartData[room] = Array.from(timestamps)
            .sort()
            .map(ts => {
                const point = { timestamp: ts };
                roomSensors.forEach(({ id, type }) => {
                    const entry = (logsBySensor[id] || []).find(l => l.timestamp === ts);
                    point[`s${id}`] = entry
                        ? unitConverter(entry.raw, type)
                        : null;
                });
                return point;
            });
    }
    return chartData;
}