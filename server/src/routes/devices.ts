
import { Router } from 'express';
import { db } from '../db.js';
import { OltDevice, OntDevice } from '../types.js';
import { randomUUID } from 'crypto';
import { AuthenticatedRequest, adminOnly } from '../authMiddleware.js';

const router = Router();

// Helper to parse JSON fields from DB
const parseDeviceFields = (device: any) => {
    const fieldsToJson = ['uplinkPorts', 'sfpOptions', 'components', 'ethernetPorts', 'wifi'];
    const newDevice = { ...device };
    for (const field of fieldsToJson) {
        if (newDevice[field] && typeof newDevice[field] === 'string') {
            newDevice[field] = JSON.parse(newDevice[field]);
        }
    }
    return newDevice;
}

// GET /api/devices
router.get('/', async (req, res) => {
    try {
        const olts = await db('olts').select('*');
        const onts = await db('onts').select('*');
        res.json({ 
            olts: olts.map(parseDeviceFields), 
            onts: onts.map(parseDeviceFields) 
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching devices' });
    }
});

// POST /api/devices/olts
router.post('/olts', adminOnly, async (req: AuthenticatedRequest, res) => {
    const newOltData = req.body as Omit<OltDevice, 'id'>;
    const newOlt: OltDevice = { ...newOltData, id: randomUUID() };

    await db('olts').insert({
        ...newOlt,
        uplinkPorts: JSON.stringify(newOlt.uplinkPorts),
        sfpOptions: JSON.stringify(newOlt.sfpOptions),
        components: JSON.stringify(newOlt.components),
    });
    res.status(201).json(newOlt);
});

// POST /api/devices/onts
router.post('/onts', adminOnly, async (req: AuthenticatedRequest, res) => {
    const newOntData = req.body as Omit<OntDevice, 'id'>;
    const newOnt: OntDevice = { ...newOntData, id: randomUUID() };
    
    await db('onts').insert({
        ...newOnt,
        ethernetPorts: JSON.stringify(newOnt.ethernetPorts),
        wifi: newOnt.wifi ? JSON.stringify(newOnt.wifi) : null,
    });
    res.status(201).json(newOnt);
});


// PUT /api/devices/olts/:id
router.put('/olts/:id', adminOnly, async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const oltData: OltDevice = req.body;
    await db('olts').where({ id }).update({
        ...oltData,
        uplinkPorts: JSON.stringify(oltData.uplinkPorts),
        sfpOptions: JSON.stringify(oltData.sfpOptions),
        components: JSON.stringify(oltData.components),
    });
    res.json(oltData);
});

// PUT /api/devices/onts/:id
router.put('/onts/:id', adminOnly, async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const ontData: OntDevice = req.body;
     await db('onts').where({ id }).update({
        ...ontData,
        ethernetPorts: JSON.stringify(ontData.ethernetPorts),
        wifi: ontData.wifi ? JSON.stringify(ontData.wifi) : null,
    });
    res.json(ontData);
});

// DELETE /api/devices/olts/:id
router.delete('/olts/:id', adminOnly, async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    await db('olts').where({ id }).del();
    res.status(204).send();
});

// DELETE /api/devices/onts/:id
router.delete('/onts/:id', adminOnly, async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    await db('onts').where({ id }).del();
    res.status(204).send();
});

// POST /api/devices/catalog
router.post('/catalog', adminOnly, async (req: AuthenticatedRequest, res) => {
    const { olts, onts } = req.body as { olts: OltDevice[], onts: OntDevice[] };
    try {
        await db.transaction(async trx => {
            await trx('olts').del();
            await trx('onts').del();
            if (olts.length > 0) {
                 await trx('olts').insert(olts.map(olt => ({
                    ...olt,
                    uplinkPorts: JSON.stringify(olt.uplinkPorts),
                    sfpOptions: JSON.stringify(olt.sfpOptions),
                    components: JSON.stringify(olt.components)
                })));
            }
            if (onts.length > 0) {
                 await trx('onts').insert(onts.map(ont => ({
                    ...ont,
                    ethernetPorts: JSON.stringify(ont.ethernetPorts),
                    wifi: ont.wifi ? JSON.stringify(ont.wifi) : null
                })));
            }
        });
        res.status(200).json({ olts, onts });
    } catch (error) {
        console.error("Catalog import error:", error);
        res.status(500).json({ message: "Failed to import catalog." });
    }
});


export default router;
