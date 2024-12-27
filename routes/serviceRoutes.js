import express from 'express';
import service from '../controllers/serviceController.js';
import user from '../controllers/userController.js';

const { createService, getService, updateService, deleteService } = service;
const { adminAuthenticate } = user

const router = express.Router();

router.post('/admin/create/service', adminAuthenticate, createService);

router.get('/get/service', getService);

router.patch('/admin/update/service', adminAuthenticate, updateService);

router.delete('/admin/delete/service', adminAuthenticate, deleteService);

export default router;
