import React, { useEffect, useState } from 'react';
import axios from 'axios';

export function SensorTable() {
    const [sensors, setSensors] = useState([]);
    const [sensorTypes, setSensorTypes] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ location: '', status: true, sensor_type: '' });
    const [newForm, setNewForm] = useState({ location: '', status: true, sensor_type: '' });

    useEffect(() => {
        async function loadSensors() {
            try {
                const r = await axios.get('/api/v1/sensor/sensors/');
                setSensors(Array.isArray(r.data) ? r.data : []);
            } catch (err) {
                console.error(err);
                setSensors([]);
            }
        }
        loadSensors();
    }, []);

    useEffect(() => {
        async function loadTypes() {
            try {
                const r = await axios.get('/api/v1/sensor/sensor-types/');
                setSensorTypes(Array.isArray(r.data) ? r.data : []);
            } catch (err) {
                console.error('Failed to load sensor types:', err);
                setSensorTypes([]);
            }
        }
        loadTypes();
    }, []);

    const startEdit = s => {
        setEditingId(s.id);
        setForm({
            location: s.location,
            status: s.status,
            sensor_type: s.sensor_type.id,
        });
    };

    const save = async id => {
        try {
            await axios.put(`/api/v1/sensor/sensors/${id}/`, form);
            setEditingId(null);
            const r = await axios.get('/api/v1/sensor/sensors/');
            setSensors(Array.isArray(r.data) ? r.data : []);
        } catch (err) {
            console.error(err);
        }
    };

    const deleteOne = async id => {
        try {
            await axios.delete(`/api/v1/sensor/sensors/${id}/`);
            setSensors(prev => prev.filter(x => x.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const createSensor = async () => {
        try {
            if (!newForm.sensor_type) {
                alert('Select a sensor type first');
                return;
            }
            await axios.post('/api/v1/sensor/sensors/', {
                location: newForm.location,
                status: newForm.status,
                sensor_type_id: newForm.sensor_type,
            });
            setNewForm({ location: '', status: true, sensor_type: '' });
            const r = await axios.get('/api/v1/sensor/sensors/');
            setSensors(Array.isArray(r.data) ? r.data : []);
        } catch (err) {
            console.error('Failed to create sensor:', err);
        }
    };

    return (
        <div>
            <h2>Добавить новый сенсор</h2>
            <div className="sensor-form">
                <select
                    value={newForm.sensor_type}
                    onChange={e => setNewForm(f => ({ ...f, sensor_type: e.target.value }))}
                >
                    <option value="">-- Выберите тип --</option>
                    {sensorTypes.map(t => (
                        <option key={t.id} value={t.id}>
                            {t.type} ({t.measurement_unit})
                        </option>
                    ))}
                </select>
                <input
                    type="text"
                    placeholder="Локация"
                    value={newForm.location}
                    onChange={e => setNewForm(f => ({ ...f, location: e.target.value }))}
                />
                <select
                    value={String(newForm.status)}
                    onChange={e => setNewForm(f => ({ ...f, status: e.target.value === 'true' }))}
                >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
                <button onClick={createSensor}>Добавить</button>
            </div>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>ID</th><th>Type</th><th>Location</th><th>Status</th><th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sensors.map(s => (
                        <tr key={s.id}>
                            <td>{s.id}</td>
                            <td>{s.sensor_type.type}</td>
                            <td>
                                {editingId === s.id ? (
                                    <input
                                        value={form.location}
                                        onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                                    />
                                ) : (
                                    s.location
                                )}
                            </td>
                            <td>
                                {editingId === s.id ? (
                                    <select
                                        value={String(form.status)}
                                        onChange={e => setForm(f => ({ ...f, status: e.target.value === 'true' }))}
                                    >
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
                                ) : (
                                    String(s.status)
                                )}
                            </td>
                            <td>
                                {editingId === s.id ? (
                                    <>
                                        <button onClick={() => save(s.id)}>Save</button>
                                        <button onClick={() => setEditingId(null)}>Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => startEdit(s)}>Edit</button>
                                        <button onClick={() => deleteOne(s.id)}>Delete</button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
