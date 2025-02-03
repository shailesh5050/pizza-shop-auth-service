import express, { NextFunction, Request, Response } from 'express';
import { AuthController } from '../Controllers/AuthController';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';
import { UserService } from '../services/UserService';
import logger from '../config/logger';
const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const authService = new UserService(userRepository);
const authController = new AuthController(authService, logger);
import { registerValidator } from '../validators/auth.validator';
router.post(
    '/register',
    registerValidator,
    (req: Request, res: Response, next: NextFunction) => {
        authController.register(req, res, next).catch(next);
    },
);

export default router;
