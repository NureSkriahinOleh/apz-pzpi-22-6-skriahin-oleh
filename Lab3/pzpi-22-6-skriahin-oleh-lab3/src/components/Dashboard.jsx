import React, { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import './Dashboard.css';
import { useSensors } from '../hooks/useSensors';
import useSensorLogsSocket from '../hooks/useSensorLogsSocket';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { UIContext } from '../App';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const { t } = useTranslation();
  const { unit } = useContext(UIContext);
  const { sensors, loading } = useSensors();
  const [logsBySensor, setLogsBySensor] = useState({});
  const [fdiByRoom, setFdiByRoom] = useState({});
  const [selectedSensorId, setSelectedSensorId] = useState(null);

  const formatValue = (val, type) => {
    let v = Number(val);
    if (type === 'temperature' && unit === 'F') {
      v = v * 9 / 5 + 32;
    }
    return +v.toFixed(2);
  };

  useEffect(() => {
    async function fetchAll() {
      const raw = {};
      await Promise.all(
        sensors.map(async sensor => {
          const res = await axios.get(
            `/api/v1/sensor/sensors/${sensor.id}/logs/`
          );
          raw[sensor.id] = res.data.map(l => ({
            timestamp: l.timestamp,
            raw: l.value,
          }));
        })
      );
      setLogsBySensor(raw);
    }
    if (sensors.length) fetchAll();
  }, [sensors]);

  const computeMetrics = useCallback((entries) => {
    const values = entries.map(e => Number(e.raw));
    const mean = values.reduce((a, b) => a + b, 0) / values.length || 0;
    const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length || 0;
    const stdDev = Math.sqrt(variance);
    return { mean, stdDev, fdi: mean ? stdDev / mean : 0 };
  }, []);

  const handleNewLog = useCallback(({ sensor_id, value, timestamp, location, sensor_type }) => {
    setLogsBySensor(prev => {
      const arr = prev[sensor_id] || [];
      const updated = [...arr, { timestamp, raw: value }];
      const { fdi } = computeMetrics(updated);
      setFdiByRoom(prevF => ({ ...prevF, [location]: fdi }));
      return { ...prev, [sensor_id]: updated };
    });
  }, [computeMetrics]);
  useSensorLogsSocket(handleNewLog);

  if (loading) return <div className="loading-container"><span>{t('loading')}</span></div>;

  const rooms = useMemo(() => sensors.reduce((acc, s) => {
    (acc[s.location] = acc[s.location] || []).push(s);
    return acc;
  }, {}), [sensors]);

  const selected = sensors.find(s => s.id === selectedSensorId);
  const filterRooms = selected ? { [selected.location]: rooms[selected.location] } : rooms;
  const colors = schemeCategory10;

  return (
    <div className="dashboard-container">
      <h1>{t('title')}</h1>
      {selectedSensorId && <button onClick={() => setSelectedSensorId(null)}>{t('show_all')}</button>}
      <div className="dashboard-grid">
        {Object.entries(filterRooms).map(([room, roomSensors]) => {
          const fdi = fdiByRoom[room] || 0;
          const isDanger = fdi > 0.6;

          // chart data: timestamps union
          const allTs = Array.from(new Set(
            roomSensors.flatMap(s => (logsBySensor[s.id] || []).map(l => l.timestamp))
          )).sort();
          const chart = allTs.map(ts => {
            const row = { timestamp: ts };
            roomSensors.forEach(s => {
              const entry = (logsBySensor[s.id] || []).find(l => l.timestamp === ts);
              row[`s${s.id}`] = entry ? formatValue(entry.raw, s.sensor_type.type) : null;
            });
            return row;
          });

          return (
            <div key={room} className={`card ${isDanger ? 'card-danger' : ''}`}>
              <div className="card-header">
                <span>{room}</span>
                <span>{t('FDI')}: {fdi.toFixed(2)}</span>
                {isDanger && <span>🚨 {t('possible_danger')}</span>}
              </div>
              <div className="card-content">
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={chart}>
                    <XAxis dataKey="timestamp" tickFormatter={t => t.slice(11, 16)} />
                    <YAxis />
                    <Tooltip formatter={v => v.toFixed(2)} />
                    <Legend />
                    {roomSensors.map((s, i) => (
                      <Line key={s.id} dataKey={`s${s.id}`} stroke={colors[i % colors.length]} dot={false} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
                <div className="sensor-list">
                  {roomSensors.map(s => {
                    const last = (logsBySensor[s.id] || []).slice(-1)[0];
                    const unitLabel = s.sensor_type.type === 'temperature'
                      ? (unit === 'C' ? t('unit_C') : t('unit_F'))
                      : s.sensor_type.measurement_unit;
                    return (
                      <div key={s.id} className={`sensor-item ${s.id === selectedSensorId ? 'selected' : ''}`} onClick={() => setSelectedSensorId(s.id)}>
                        <span>{t('Sensor')}#{s.id}</span>
                        <span>{last ? `${formatValue(last.raw, s.sensor_type.type)} ${unitLabel}` : t('no_logs')}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
