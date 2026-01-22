import express from 'express';
import {upload} from '../middlewares/multer.js';
import {analyzeData} from '../services/analyzeData.js';

const router = express.Router();

router.post('/get-analytics-data', upload.single('file'), analyzeData);

export default router;
