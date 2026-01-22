import express from 'express';
import {refreshAccessToken} from '../handles/auth/refreshAccessToken.js';

const router = express.Router();

router.get('/refresh-access-token', refreshAccessToken);

export default router;
