import { io } from 'socket.io-client';

const socket = io('https://chatapp-f2i6.onrender.com', {
// const socket = io('http://localhost:3000', {
  withCredentials: true,
});
export default socket;
