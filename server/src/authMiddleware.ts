import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from './types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

// FIX: Define AuthenticatedRequest as an interface that extends the base Express Request type.
// This ensures that all properties of Request (like headers, body, params) are available,
// while also adding the custom 'user' property. This resolves type errors in this file and in route handlers.
export interface AuthenticatedRequest extends Request {
    user?: User;
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ messageKey: 'auth.error.unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as User;
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ messageKey: 'auth.error.invalidToken' });
    }
};

export const adminOnly = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ messageKey: 'auth.error.unauthorized' });
    }
    next();
};