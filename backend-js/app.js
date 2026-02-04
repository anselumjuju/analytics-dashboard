import express from 'express';
import dotenv from 'dotenv';
import 'module-alias/register.js';

import routes from './routes/index.js';
import cors from 'cors';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({message: 'Server is working'});
});

export default app;
