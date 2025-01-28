import { UserData } from '../types';
import { User } from '../entity/User';
import { Repository } from 'typeorm';
import createHttpError from 'http-errors';
import { Roles } from '../constants';

export class UserService {
    constructor(private userRepository: Repository<User>) {}
    async create({
        firstName,
        lastName,
        email,
        password,
    }: UserData): Promise<User> {
        try {
            const existingUser = await this.userRepository.findOne({
                where: { email },
            });
            if (existingUser) {
                throw createHttpError(409, 'Email already registered');
            }

            const user = this.userRepository.create({
                firstName,
                lastName,
                email,
                password,
                role: Roles.CUSTOMER,
            });
            return await this.userRepository.save(user);
        } catch (error) {
            if (error instanceof Error && 'status' in error) {
                throw error;
            }
            throw createHttpError(500, 'Failed to create user in the database');
        }
    }
}
