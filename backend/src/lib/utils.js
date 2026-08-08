export function encode(value) {
  return encodeURIComponent(value);
}

export function jsonResponse(res, status, body) {
  res.status(status).json(body);
}

export function sendError(res, status, message) {
  return jsonResponse(res, status, {
    success: false,
    status,
    data: {message},
  });
}

export function safeJson(text) {
  const cleaned = String(text || '')
    .replaceAll('```json', '')
    .replaceAll('```', '')
    .trim();
  return JSON.parse(cleaned);
}
