import express from 'express';
import {upload} from '../middlewares/multer.js';
import {analyzeData} from '../services/analyzeData.js';
import {deleteWorkSpace} from '../services/routes/deleteWorkspaces.js';
import {geminiPrompt} from '../services/routes/geminiPrompt.js';
import {validatePrompt} from '../services/routes/validatePrompt.js';

const router = express.Router();

router.post('/get-analytics-data', upload.single('file'), analyzeData);
router.get('/delete-workspaces', deleteWorkSpace);
router.get('/gemini-prompt', geminiPrompt);
router.get('/validate-prompt', validatePrompt);

export default router;
