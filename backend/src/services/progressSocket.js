const sockets = new Map();

export function setProgressSocket(jobId, socket) {
  sockets.set(jobId, socket);
}

export function clearProgressSocket(jobId) {
  sockets.delete(jobId);
}

export function getProgressSocket(jobId) {
  return sockets.get(jobId);
}

export function sendProgress(jobId, progress, message) {
  const socket = sockets.get(jobId);
  if (!socket || socket.readyState !== 1) return;

  try {
    socket.send(JSON.stringify({progress, message}));
  } catch (error) {
    console.log(`Error sending progress ws ${error.message}`);
  }
}
