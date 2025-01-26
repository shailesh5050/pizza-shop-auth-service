import { UserData } from '../types';
import { User } from '../entity/User';
import { Repository } from 'typeorm';

export class UserService {
    constructor(private userRepository: Repository<User>) {}
    async create({
        firstName,
        lastName,
        email,
        password,
    }: UserData): Promise<User> {
        const user = this.userRepository.create({
            firstName,
            lastName,
            email,
            password,
        });
        return await this.userRepository.save(user);
    }
}
