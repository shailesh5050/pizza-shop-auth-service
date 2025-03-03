import express, { NextFunction, Request, Response } from 'express';
import { AuthController } from '../Controllers/AuthController';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';
import { UserService } from '../services/UserService';
import { TokenService } from '../services/TokenService';
import { registerValidator,loginValidator } from '../validators/auth.validator';
import logger from '../config/logger';
import { RefreshToken } from '../entity/RefreshToken';

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const authService = new UserService(userRepository);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const tokenService = new TokenService(refreshTokenRepository);
const authController = new AuthController(authService, logger, tokenService);
router.post(
    '/register',
    registerValidator,
    (req: Request, res: Response, next: NextFunction) => {
        authController.register(req, res, next).catch(next);
    },
);

router.post('/login',loginValidator, (req: Request, res: Response, next: NextFunction) => {
    authController.login(req, res, next).catch(next);
});

export default router;
