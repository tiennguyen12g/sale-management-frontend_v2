// socketService.ts
// import { io, Socket } from "socket.io-client";
// import { socketAPI } from "../configs/api";
// let socket: Socket | null = null;

// export const getSocket = () => {
//   if (!socket) {
//     socket = io(socketAPI, {
//       autoConnect: true,
//       reconnection: true,
//       reconnectionAttempts: Infinity,
//       reconnectionDelay: 2000,
//     });
//   }
//   return socket;
// };

// socketService.ts
import { io, Socket } from "socket.io-client";
import { socketAPI } from "../config/api";
let socket: Socket | null = null;

export const getSocket = (staffID: string) => {
  if (!socket) {
    // Use socketAPI from config (will be HTTPS through Nginx if page is HTTPS)
    // Socket.IO automatically uses wss:// when socketAPI is https://
    const isHTTPS = typeof window !== "undefined" && window.location.protocol === "https:";
    
    console.log("🔌 Connecting Socket.IO:", {
      socketAPI,
      path: isHTTPS ? "/socket" : "/socket.io",
      staffID
    });
    
    socket = io(socketAPI, {
      path: isHTTPS ? "/socket" : "/socket.io", // Nginx proxies /socket, direct uses /socket.io
      transports: ["websocket", "polling"], // Allow fallback to polling
      query: { staffID },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      forceNew: false, // Reuse connection if exists
    });

    socket.on("connect", () => {
      console.log("✅ Connected to socket:", socketAPI);
    });
    socket.on("disconnect", (reason) => {
      console.log("❌ Disconnected from socket:", reason);
    });
    socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error.message, "URL:", socketAPI);
    });
    socket.on("message:new", (msg) => console.log("💬 New message received:", msg));
  }
  return socket;
};
