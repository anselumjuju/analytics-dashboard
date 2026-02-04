import app from './app.js';

const PORT = process.env.PORT || 5000;

console.log('Starting server...');

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
