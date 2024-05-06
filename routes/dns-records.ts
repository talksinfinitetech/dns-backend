import express from 'express';
import { listDnsRecords, createDnsRecords, updateDnsRecords, deleteDnsRecords, bulkDnsUpload } from '../controllers/dns-records-controller';
import multer from 'multer';

const upload = multer();

const router = express.Router();

router.get('/dns-record/:zone_id', listDnsRecords);
router.post('/dns-record', createDnsRecords);
router.put('/dns-record', updateDnsRecords);
router.delete('/dns-record/:zone_id', deleteDnsRecords);
router.post('/dns-record/upload', upload.single('file'), bulkDnsUpload)

export default router;