// src/components/NotificationTable.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export function NotificationTable() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const r = await axios.get('/api/v1/notification/notifications/');
        setNotes(Array.isArray(r.data) ? r.data : []);
      } catch (err) {
        console.error(err);
        setNotes([]);
      }
    }
    load();
  }, []);

  const toggleRead = async id => {
    try {
      const note = notes.find(n => n.id === id);
      const r = await axios.patch(
        `/api/v1/notification/notifications/${id}/`,
        { is_read: !note.is_read }
      );
      setNotes(ns => ns.map(n => n.id === id ? r.data : n));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteOne = async id => {
    try {
      await axios.delete(`/api/v1/notification/notifications/${id}/`);
      setNotes(ns => ns.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>ID</th><th>User</th><th>Title</th><th>Message</th><th>Read</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {notes.map(n => (
          <tr key={n.id}>
            <td>{n.id}</td>
            <td>{n.user}</td>
            <td>{n.title}</td>
            <td>{n.message}</td>
            <td>{n.is_read ? '✔️' : '—'}</td>
            <td>
              <button onClick={() => toggleRead(n.id)}>
                {n.is_read ? 'Mark Unread' : 'Mark Read'}
              </button>
              <button onClick={() => deleteOne(n.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
