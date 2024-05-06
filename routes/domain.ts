import express from 'express';
import { listDomains, createHostedZone, deleteHostedZone,bulkDomainUpload } from '../controllers/domain-controller';
const router = express.Router();
import multer from 'multer';
const upload = multer();

router.get('/domain', listDomains);
router.post('/create-domain', createHostedZone);
router.delete('/delete-domain/:zoneId', deleteHostedZone);
router.post('/bulk-domain', upload.single('file'), bulkDomainUpload);
export default router;