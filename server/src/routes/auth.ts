
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { db } from '../db';
import { User } from '../types';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    if (password.length < 6) {
        return res.status(400).json({ messageKey: 'auth.error.passwordTooShort' });
    }

    const existingUser = await db<User>('users').where({ email }).first();
    if (existingUser) {
        return res.status(409).json({ messageKey: 'auth.error.emailExists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser: User = {
        id: randomUUID(),
        email,
        passwordHash,
        role: 'user',
        verified: false,
    };

    await db('users').insert(newUser);

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await db('verification_codes').insert({ email, code, expiresAt }).onConflict('email').merge();

    // In a real app, you would send an email here using SMTP settings
    console.log(`Verification code for ${email}: ${code}`);
    
    // Check for SMTP config to return appropriate message
    const smtpConfig = await db('settings').where({ key: 'smtpConfig' }).first();
    if (smtpConfig && smtpConfig.value) {
        return res.status(201).json({ messageKey: 'auth.success.registerSmtp', verificationCode: code });
    }
    
    return res.status(201).json({ messageKey: 'auth.success.register', verificationCode: code });
});

// POST /api/auth/verify
router.post('/verify', async (req, res) => {
    const { email, code } = req.body;

    const record = await db('verification_codes').where({ email }).first();

    if (!record || record.code !== code || new Date() > new Date(record.expiresAt)) {
        return res.status(400).json({ messageKey: 'auth.error.invalidCode' });
    }

    await db('users').where({ email }).update({ verified: true });
    await db('verification_codes').where({ email }).del();

    res.status(200).json({ messageKey: 'auth.success.verify' });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await db<User>('users').where({ email }).first();

    if (!user) {
        return res.status(401).json({ messageKey: 'auth.error.invalidCredentials' });
    }

    if (!user.verified) {
        return res.status(403).json({ messageKey: 'auth.error.notVerified' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
        return res.status(401).json({ messageKey: 'auth.error.invalidCredentials' });
    }

    const userForToken: Omit<User, 'passwordHash'> = {
        id: user.id,
        email: user.email,
        role: user.role,
        verified: user.verified
    };

    const token = jwt.sign(userForToken, JWT_SECRET, { expiresIn: '1d' });

    res.json({ user: userForToken, token });
});


export default router;
