import { Response, NextFunction } from 'express';
import RegisterUserRequest from '../types';
import { UserService } from '../services/UserService';
import { Logger } from 'winston';
import { Roles } from '../constants';
import { JwtPayload, sign } from 'jsonwebtoken';
import { readFileSync } from 'fs';
import path from 'path';
import createHttpError from 'http-errors';
import { Config } from '../config';
export class AuthController {
    userService: UserService;
    constructor(
        userService: UserService,
        private logger: Logger,
    ) {
        this.userService = userService;
    }
    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        const { firstName, lastName, email, password } = req.body;
        this.logger.debug(`Registering user ${email}`);

        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
                role: Roles.CUSTOMER,
            });
            this.logger.info(`User ${user.id} registered successfully`);

            let privateKey: string;
            try {
                privateKey = readFileSync(
                    path.join(__dirname, '../../certs/private.pem'),
                    'utf-8',
                );
            } catch (error) {
                this.logger.error('Error reading private key file:', error);
                createHttpError(500, 'Error reading private key file');
                next(error);
                return;
            }
            const payload: JwtPayload = {
                id: user.id,
                email: user.email,
                role: user.role,
            };
            const accessToken = sign(payload, privateKey, {
                expiresIn: '1h',
                algorithm: 'RS256',
                issuer: 'auth-service',
            });
            const refreshToken = sign(payload, Config.REFRESH_TOKEN!, {
                expiresIn: '1y',
                algorithm: 'HS256',
                issuer: 'auth-service',
            });
            res.cookie('refreshToken', refreshToken, {
                domain: 'localhost',
                maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year in milliseconds
                sameSite: 'strict',
            });
            res.cookie('accessToken', accessToken, {
                domain: 'localhost',
                maxAge: 3600000,
                sameSite: 'strict',
            });

            res.status(200).json({
                message: 'register',
                user: { email },
            });
        } catch (error) {
            if (error instanceof Error) {
                if ('status' in error) {
                    const httpError = error as Error & { status: number };
                    return res
                        .status(httpError.status)
                        .json({ error: httpError.message });
                }
                this.logger.error('Registration error:', error);
                next(error);
                return;
            }
            this.logger.error('Unknown registration error');
            next(new Error('An unexpected error occurred'));
            return;
        }
    }
}
