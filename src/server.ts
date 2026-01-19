import app from "./app";
import http from "http";
import { initSocket } from "../src/socket/socket";

const PORT = 3000;
const server = http.createServer(app);
initSocket(server);
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

