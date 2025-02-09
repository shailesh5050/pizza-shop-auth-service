import express, { NextFunction, Request, Response } from 'express';
import { AuthController } from '../Controllers/AuthController';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';
import { UserService } from '../services/UserService';
import { TokenService } from '../services/TokenService';
import { registerValidator } from '../validators/auth.validator';
import logger from '../config/logger';

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const authService = new UserService(userRepository);
const tokenService = new TokenService();
const authController = new AuthController(authService, logger, tokenService);
router.post(
    '/register',
    registerValidator,
    (req: Request, res: Response, next: NextFunction) => {
        authController.register(req, res, next).catch(next);
    },
);

export default router;
