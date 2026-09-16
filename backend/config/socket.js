const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io = null;

// Initializes Socket.IO on top of the existing HTTP server. Each socket
// authenticates with the SAME JWT used for normal API calls (sent once at
// connection time, not per-message) and is placed into a room based on who
// they are:
//   - staff/admin  -> the shared "staff" room (every staff member sees every
//     new appointment request, live)
//   - a patient    -> their own private "patient:<id>" room (only that
//     patient receives updates about their own appointments)
// This is what makes "the admin sees a popup the instant a patient books,
// with no page reload" and "the patient sees a popup the instant staff
// approves/declines" both possible.
function initSocket(server) {
  io = new Server(server, {
    cors: { origin: "*" }, // the API itself already restricts by JWT; CORS here just allows the browser to open the socket
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication required"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // { id, role, name }
      next();
    } catch (err) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const { id, role } = socket.user;
    if (role === "admin" || role === "staff") {
      socket.join("staff");
    } else if (role === "patient") {
      socket.join(`patient:${id}`);
    }
  });

  return io;
}

function getIO() {
  if (!io) throw new Error("Socket.IO has not been initialized yet");
  return io;
}

// Safe helpers — never throw if sockets aren't set up (e.g. during tests),
// so a missing/broken socket layer never breaks the underlying HTTP feature.
function notifyStaff(event, payload) {
  try {
    getIO().to("staff").emit(event, payload);
  } catch (err) {
    console.error("[socket] notifyStaff failed:", err.message);
  }
}

function notifyPatient(patientId, event, payload) {
  try {
    getIO().to(`patient:${patientId}`).emit(event, payload);
  } catch (err) {
    console.error("[socket] notifyPatient failed:", err.message);
  }
}

module.exports = { initSocket, getIO, notifyStaff, notifyPatient };
