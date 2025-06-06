import { io } from 'socket.io-client';
export const socket = new WebSocket('ws://localhost:8000/ws/sensors/');
export default socket;