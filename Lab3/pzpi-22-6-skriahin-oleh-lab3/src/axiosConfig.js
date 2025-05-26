import axios from 'axios';

axios.defaults.headers.common['Authorization'] = 
  `Bearer ${localStorage.getItem('token')}`;

axios.defaults.baseURL = '/api';