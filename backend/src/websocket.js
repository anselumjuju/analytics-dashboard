import {WebSocketServer} from 'ws';
import {setProgressSocket, clearProgressSocket, getProgressSocket} from './services/progressSocket.js';

let wsServer;

export function attachWebSocketServer(server) {
  wsServer = new WebSocketServer({noServer: true});

  server.on('upgrade', (request, socket, head) => {
    try {
      const url = new URL(request.url, 'http://localhost');
      const match = url.pathname.match(/^\/ws\/progress\/([^/]+)$/);
      if (!match) {
        socket.destroy();
        return;
      }

      wsServer.handleUpgrade(request, socket, head, (ws) => {
        wsServer.emit('connection', ws, request, match[1]);
      });
    } catch {
      socket.destroy();
    }
  });

  wsServer.on('connection', (ws, _request, jobId) => {
    setProgressSocket(jobId, ws);
    console.log(`WS connected: ${jobId}`);

    ws.on('close', () => {
      clearProgressSocket(jobId);
      console.log(`WS closed: ${jobId}`);
    });
  });
}

export function sendProgress(jobId, progress, message) {
  const ws = getProgressSocket(jobId);
  if (!ws || ws.readyState !== 1) return;

  try {
    ws.send(JSON.stringify({progress, message}));
  } catch (error) {
    console.log(`Error sending progress ws ${error.message}`);
  }
}
