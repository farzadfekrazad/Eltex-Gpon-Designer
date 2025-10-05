
import { Router } from 'express';
import { db } from '../db.js';
import { SmtpConfig } from '../types.js';
import { adminOnly } from '../authMiddleware.js';
import faDefaults from '../i18n/locales/fa.js';

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


export default router;