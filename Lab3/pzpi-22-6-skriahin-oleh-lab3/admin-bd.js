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