import { useEffect, useState } from 'react';
import axios from 'axios';

export function useSensors() {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/v1/sensor/sensors/')
      .then(({ data }) => setSensors(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return { sensors, loading };
}
