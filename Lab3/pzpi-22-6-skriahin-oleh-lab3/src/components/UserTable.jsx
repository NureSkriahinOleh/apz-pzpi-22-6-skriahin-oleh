import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ROLE_CHOICES = [
  { value: 'admin', label: 'Admin' },
  { value: 'admindb', label: 'AdminDB' },
  { value: 'guard', label: 'Guard' },
  { value: 'visitor', label: 'Visitor' },
];

export function UserTable() {
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ username: '', email: '', role: '', phone_number: '' });

  useEffect(() => {
    async function loadUsers() {
      try {
        const r = await axios.get('/api/v1/user/users/');
        setUsers(Array.isArray(r.data) ? r.data : []);
      } catch (err) {
        console.error('Failed to load users:', err);
        setUsers([]);
      }
    }
    loadUsers();
  }, []);

  const startEdit = user => {
    setEditingId(user.id);
    setForm({
      username: user.username,
      email: user.email,
      role: user.role,
      phone_number: user.phone_number || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ username: '', email: '', role: '', phone_number: '' });
  };

  const saveUser = async id => {
    try {
      await axios.put(`/api/v1/user/users/${id}/`, {
        username: form.username,
        email: form.email,
        role: form.role,
        phone_number: form.phone_number,
      });
      setEditingId(null);
      setUsers(prev =>
        prev.map(u => (u.id === id ? { ...u, ...form } : u))
      );
    } catch (err) {
      console.error('Failed to save user:', err);
    }
  };

  const deleteUser = async id => {
    try {
      await axios.delete(`/api/v1/user/users/${id}/`);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Username</th>
          <th>Email</th>
          <th>Role</th>
          <th>Phone</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map(u => (
          <tr key={u.id}>
            <td>{u.id}</td>
            <td>
              {editingId === u.id ? (
                <input
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                />
              ) : (
                u.username
              )}
            </td>
            <td>
              {editingId === u.id ? (
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
              ) : (
                u.email
              )}
            </td>
            <td>
              {editingId === u.id ? (
                <select
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                >
                  {ROLE_CHOICES.map(r => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              ) : (
                u.role
              )}
            </td>
            <td>
              {editingId === u.id ? (
                <input
                  value={form.phone_number}
                  onChange={e => setForm(f => ({ ...f, phone_number: e.target.value }))}
                />
              ) : (
                u.phone_number || '-'
              )}
            </td>
            <td>
              {editingId === u.id ? (
                <>
                  <button onClick={() => saveUser(u.id)}>Save</button>
                  <button onClick={cancelEdit}>Cancel</button>
                </>
              ) : (
                <>
                  <button onClick={() => startEdit(u)}>Edit</button>
                  <button onClick={() => deleteUser(u.id)}>Delete</button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

