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