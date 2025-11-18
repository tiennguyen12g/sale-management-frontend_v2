// workers/orderWorker.js
// Classic Worker (not ES module)
importScripts("https://cdn.socket.io/4.7.2/socket.io.min.js");

let socket = null;

self.onmessage = (event) => {
  const { type, staffID, serverUrl } = event.data;

  // ---------- CONNECT ----------
  if (type === "connect") {
    const isHTTPS = serverUrl?.startsWith("https");

    socket = io(serverUrl, {
      path: isHTTPS ? "/socket" : "/socket.io",
      transports: ["websocket", "polling"],
      query: { staffID },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
    });

    socket.on("connect", () => {
      self.postMessage({ type: "connected" });
    });

    socket.on("disconnect", () => {
      self.postMessage({ type: "disconnected" });
    });

    socket.on("new-order", (payload) => {
      self.postMessage({ type: "new-order", payload });
    });
  }

  // ---------- DISCONNECT ----------
  if (type === "disconnect" && socket) {
    socket.disconnect();
  }
};
