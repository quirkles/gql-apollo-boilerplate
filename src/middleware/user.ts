import { AppRequest, AppUser } from '../appContext';
import { NextFunction, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { config } from '../../config';

interface JwtBody {
    email: string;
    sub: string;
}

export const getUserMiddleware = () => (req: AppRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.split('Bearer ')[1];
    let user: AppUser;
    if (token) {
        const { email, sub } = verify(token, config.JWT_SECRET) as JwtBody;
        user = { email, id: sub };
        req.user = user;
    }
    return next();
};
