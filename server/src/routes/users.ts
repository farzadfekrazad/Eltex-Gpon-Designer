
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { db } from '../db';
import { User, UserRole } from '../types';
import { adminOnly } from '../authMiddleware';

const router = Router();

// All routes in this file are admin-only
router.use(adminOnly);

// GET /api/users
router.get('/', async (req, res) => {
    const users = await db<User>('users').select('id', 'email', 'role', 'verified');
    res.json(users);
});

// POST /api/users
router.post('/', async (req, res) => {
    const { email, password, role } = req.body as { email: string; password: string; role: UserRole };

    if (!email || !password || !role) {
        return res.status(400).json({ message: 'Email, password, and role are required' });
    }

    const existingUser = await db('users').where({ email }).first();
    if (existingUser) {
        return res.status(409).json({ messageKey: 'auth.error.emailExists' });
    }
    
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser: User = {
        id: randomUUID(),
        email,
        passwordHash,
        role,
        verified: true, // Admins create verified users
    };
    
    await db('users').insert(newUser);
    const { passwordHash: _, ...userToReturn } = newUser;
    res.status(201).json(userToReturn);
});

// PUT /api/users/:id/role
router.put('/:id/role', async (req, res) => {
    const { id } = req.params;
    const { role } = req.body as { role: UserRole };

    const user = await db('users').where({ id }).first();
    if (!user) {
        return res.status(404).json({ messageKey: 'auth.error.userNotFound' });
    }
    // Prevent self-demotion or changing the main admin
    if (user.email === 'admin@pol.designer') {
        return res.status(403).json({ message: 'Cannot change role of default admin' });
    }

    await db('users').where({ id }).update({ role });
    res.status(200).json({ messageKey: 'auth.success.userUpdated' });
});

// DELETE /api/users/:id
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    
    const user = await db('users').where({ id }).first();
    if (!user) {
        return res.status(404).json({ messageKey: 'auth.error.userNotFound' });
    }
    if (user.role === 'admin') {
         return res.status(403).json({ message: 'Cannot delete an admin user' });
    }

    await db('users').where({ id }).del();
    res.status(204).send();
});


export default router;
