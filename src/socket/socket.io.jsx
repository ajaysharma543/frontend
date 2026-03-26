import { io } from 'socket.io-client';

const socket = io('https://chatapp-f2i6.onrender.com', {
  withCredentials: true,
});
export default socket;
