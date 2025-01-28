import { Request } from 'express';
export interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
}

interface RegisterUserRequest extends Request {
    body: UserData;
}

export default RegisterUserRequest;
