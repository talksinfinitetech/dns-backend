import express from 'express';
import { login, signup, logout } from '../controllers/user-controller';

const router = express.Router();

router.post('/login', login);
router.post('/signup', signup);
router.get('/logout', logout);

export default router;