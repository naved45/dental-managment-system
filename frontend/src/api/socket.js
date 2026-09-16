import { io } from "socket.io-client";

// One shared socket connection, created lazily and reused. It authenticates
// with the same JWT already used for normal API calls (staff token OR
// patient token — whichever is passed in), so the server can put this
// connection in the right "room" (see backend/config/socket.js).
const SOCKET_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");

let socket = null;

export function connectSocket(token) {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  if (!token) return null;
  socket = io(SOCKET_URL, { auth: { token }, transports: ["websocket", "polling"] });
  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
