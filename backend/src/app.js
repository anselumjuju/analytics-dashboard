import express from 'express';
import dotenv from 'dotenv';
import routes from '../routes/index.js';

dotenv.config();

const app = express();

app.use(express.json());

app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({message: 'Server is working'});
});

export default app;
