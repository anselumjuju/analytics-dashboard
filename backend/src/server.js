import http from 'node:http';
import {createApp} from './app.js';
import {attachWebSocketServer} from './websocket.js';

const port = Number(process.env.PORT || 8081);
const app = createApp();
const server = http.createServer(app);

attachWebSocketServer(server);

server.listen(port, () => {
  console.log(`backend listening on http://localhost:${port}`);
});
