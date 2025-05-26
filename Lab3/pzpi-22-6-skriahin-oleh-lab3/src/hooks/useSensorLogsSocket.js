import { useEffect } from 'react';

export default function useSensorLogsSocket(onMessage) {
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/sensors/logs/');

    ws.onopen = () => console.log('WS connected');
    ws.onmessage = e => {
      try {
        const data = JSON.parse(e.data);
        onMessage(data);
      } catch (err) { console.error(err); }
    };
    ws.onerror = e => console.error('WS error', e);
    ws.onclose = () => console.log('WS disconnected');

    return () => ws.close();
  }, [onMessage]);
}
