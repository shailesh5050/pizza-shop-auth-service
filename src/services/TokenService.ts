import { sign, JwtPayload } from 'jsonwebtoken';
import { readFileSync } from 'fs';
import path from 'path';
import createHttpError from 'http-errors';
import { Config } from '../config';
import { RefreshToken } from '../entity/RefreshToken';
import { User } from '../entity/User';
import { Repository } from 'typeorm';

export class TokenService {
    constructor(private refreshTokenRepository: Repository<RefreshToken>) {}
    generateAccessToken(payload: JwtPayload) {
        let privateKey: string;
        try {
            privateKey = readFileSync(
                path.join(__dirname, '../../certs/private.pem'),
                'utf-8',
            );
        } catch (error) {
            createHttpError(500, 'Error reading private key file');
            throw error;
            return;
        }
        const accessToken = sign(payload, privateKey, {
            expiresIn: '1h',
            algorithm: 'RS256',
            issuer: 'auth-service',
        });
        return accessToken;
    }

    generateRefreshToken(payload: JwtPayload) {
        const refreshToken = sign(payload, Config.REFRESH_TOKEN!, {
            expiresIn: '1y',
            algorithm: 'HS256',
            issuer: 'auth-service',
            jwtid: String(payload.id),
        });
        return refreshToken;
    }

    async persistRefreshToken(user: User) {
        const token = await this.refreshTokenRepository.save({
            user: user,
            expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year in milliseconds
        });
        return token;
    }
}
