import { Response } from 'express';
import RegisterUserRequest from '../types';
import { UserService } from '../services/UserService';

export class AuthController {
    userService: UserService;
    constructor(userService: UserService) {
        this.userService = userService;
    }
    async register(req: RegisterUserRequest, res: Response) {
        const { firstName, lastName, email, password } = req.body;

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
            await this.userService.create({
                firstName,
                lastName,
                email,
                password,
            });
            return res.status(200).json({
                message: 'register',
                user: { email },
            });
        } catch (error) {
            const err = error as { code?: string };
            if (err.code === '23505') {
                // PostgreSQL unique violation error code
                return res
                    .status(409)
                    .json({ error: 'Email already registered' });
            }
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}
