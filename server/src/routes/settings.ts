
import { Router } from 'express';
import { db, dbPath, resetDatabase } from '../db';
import { SmtpConfig } from '../types';
import { adminOnly } from '../authMiddleware';
import faDefaults from '../i18n/locales/fa';
import fs from 'fs';

const router = Router();

// All routes here are admin-only
router.use(adminOnly);

// SMTP Settings
router.get('/smtp', async (req, res) => {
    const setting = await db('settings').where({ key: 'smtpConfig' }).first();
    if (setting) {
        res.json(JSON.parse(setting.value));
    } else {
        res.json(null); // No settings found
    }
});

router.post('/smtp', async (req, res) => {
    const smtpConfig: SmtpConfig = req.body;
    const value = JSON.stringify(smtpConfig);
    await db('settings')
        .insert({ key: 'smtpConfig', value })
        .onConflict('key')
        .merge();
    res.status(200).json(smtpConfig);
});


// Translation Settings
router.get('/translations/fa', async (req, res) => {
    const setting = await db('settings').where({ key: 'customTranslations_fa' }).first();
    if (setting) {
        res.json(JSON.parse(setting.value));
    } else {
        res.json({}); // Return empty object if no custom translations exist
    }
});

router.post('/translations/fa', async (req, res) => {
    const translations = req.body;
    
    // Store only the values that differ from default
    const customTranslations: Record<string, string> = {};
    for (const key in translations) {
        if (translations[key] !== faDefaults[key as keyof typeof faDefaults]) {
            customTranslations[key] = translations[key];
        }
    }
    
    const value = JSON.stringify(customTranslations);

    await db('settings')
        .insert({ key: 'customTranslations_fa', value })
        .onConflict('key')
        .merge();
        
    res.status(200).json(customTranslations);
});

router.delete('/translations/fa', async (req, res) => {
    await db('settings').where({ key: 'customTranslations_fa' }).del();
    res.status(204).send();
});

// Database Management
router.get('/db-status', (req, res) => {
    res.json({ type: 'SQLite', status: 'Connected' });
});

router.post('/db-backup', (req, res) => {
    if (!fs.existsSync(dbPath)) {
        return res.status(404).json({ message: 'Database file not found.' });
    }
    res.download(dbPath, `pol_designer_backup.db`, (err) => {
        if (err) {
            console.error("Error sending backup file:", err);
        }
    });
});

router.post('/db-reset', async (req, res) => {
    try {
        await resetDatabase();
        res.status(200).json({ message: 'Database reset successfully' });
    } catch (error) {
        console.error('Failed to reset database:', error);
        res.status(500).json({ message: 'Database reset failed' });
    }
});


export default router;
