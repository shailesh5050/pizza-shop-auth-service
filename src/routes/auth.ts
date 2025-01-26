import express from 'express';
import { AuthController } from '../Controllers/AuthController';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';
import { UserService } from '../services/UserService';
const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const authService = new UserService(userRepository);
const authController = new AuthController(authService);

router.post('/register', (req, res, next) => {
    authController.register(req, res).catch(next);
});

export default router;
