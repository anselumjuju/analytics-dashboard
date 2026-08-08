import http from 'node:http';
import {createApp} from './app.js';
import {attachWebSocketServer} from './websocket.js';
import {env} from './lib/env.js';

const port = Number(env.PORT || 8081);
const app = createApp();
const server = http.createServer(app);

attachWebSocketServer(server);

server.listen(port, () => {
  console.log(`backend-js listening on http://localhost:${port}`);
});
