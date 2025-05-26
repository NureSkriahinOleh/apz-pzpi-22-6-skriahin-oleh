import React, { useEffect, useState } from 'react';
import axios from 'axios';

export function IncidentTable() {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const r = await axios.get('/api/v1/incident/incidents/');
        setIncidents(Array.isArray(r.data) ? r.data : []);
      } catch (err) {
        console.error(err);
        setIncidents([]);
      }
    }
    load();
  }, []);

  const deleteOne = async id => {
    try {
      await axios.delete(`/api/v1/incident/incidents/${id}/`);
      setIncidents(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>ID</th><th>Type</th><th>Location</th><th>FDI</th><th>Created At</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {incidents.map(i => (
          <tr key={i.id}>
            <td>{i.id}</td>
            <td>{i.type}</td>
            <td>{i.location}</td>
            <td>{i.FDI || i.fdi}</td>
            <td>{new Date(i.created_at).toLocaleString()}</td>
            <td>
              <button onClick={() => deleteOne(i.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}