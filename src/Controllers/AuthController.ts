import { Response, NextFunction } from 'express';
import RegisterUserRequest from '../types';
import { UserService } from '../services/UserService';
import { Logger } from 'winston';
import { Roles } from '../constants';
import { JwtPayload } from 'jsonwebtoken';
import { TokenService } from '../services/TokenService';
export class AuthController {
    userService: UserService;
    constructor(
        userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
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

            const payload: JwtPayload = {
                id: user.id,
                email: user.email,
                role: user.role,
            };
            const accessToken = this.tokenService.generateAccessToken(payload);
            const refreshToken = this.tokenService.persistRefreshToken(user);


            const newrefreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String((await refreshToken).id),
            });
            res.cookie('refreshToken', newrefreshToken, {
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
