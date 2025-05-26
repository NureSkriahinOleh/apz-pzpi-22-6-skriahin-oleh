import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { IncidentTable } from './IncidentTable';
import { NotificationTable } from './NotificationTable';
import { SensorTable } from './SensorTable';
import { UserTable } from './UserTable';
import './AdminPanel.css';

export default function AdminPanel() {
  const { t } = useTranslation();
  const [tab, setTab] = useState('incidents');
  const [loading, setLoading] = useState(false);

  const handleAdminAction = async (action) => {
    let url;
    switch (action) {
      case 'makemigrations':
        url = '/api/v1/admin/make-migrations/';
        break;
      case 'migrate':
        url = '/api/v1/admin/migrate/';
        break;
      case 'backup':
        url = '/api/v1/admin/backup/';
        break;
      case 'restore':
        url = '/api/v1/admin/restore/';
        break;
      default:
        return;
    }
    setLoading(true);
    try {
      const r = await axios.post(url);
      alert(r.data.message || t('Action completed successfully'));
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || t('An error occurred');
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <h1>{t('Admin Dashboard')}</h1>

      <div className="admin-actions">
        <button
          disabled={loading}
          onClick={() => handleAdminAction('makemigrations')}
        >
          {t('Create Migrations')}
        </button>
        <button
          disabled={loading}
          onClick={() => handleAdminAction('migrate')}
        >
          {t('Apply Migrations')}
        </button>
        <button
          disabled={loading}
          onClick={() => handleAdminAction('backup')}
        >
          {t('Backup Database')}
        </button>
        <button
          disabled={loading}
          onClick={() => handleAdminAction('restore')}
        >
          {t('Restore Database')}
        </button>
        {loading && <span className="loading-indicator">{t('Processing...')}</span>}
      </div>

      <nav className="admin-tabs">
        {['incidents', 'notifications', 'sensors', 'users'].map(key => (
          <button
            key={key}
            className={tab === key ? 'active' : ''}
            onClick={() => setTab(key)}
          >
            {t(key)}
          </button>
        ))}
      </nav>
      <div className="admin-content">
        {tab === 'incidents' && <IncidentTable />}
        {tab === 'notifications' && <NotificationTable />}
        {tab === 'sensors' && <SensorTable />}
        {tab === 'users' && <UserTable />}
      </div>
    </div>
  );
}
