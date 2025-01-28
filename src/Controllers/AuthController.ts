import { Response, NextFunction } from 'express';
import RegisterUserRequest from '../types';
import { UserService } from '../services/UserService';
import { Logger } from 'winston';
import { Roles } from '../constants';

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
        // Validate required fields
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ error: 'Required fields missing' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Validate password strength
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password too weak' });
        }

        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
                role: Roles.CUSTOMER,
            });
            this.logger.info(`User ${user.id} registered successfully`);
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
