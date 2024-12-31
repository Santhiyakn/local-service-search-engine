import express from 'express';
import serviceProvider from '../controllers/serviceProviderController.js';
import user from '../controllers/userController.js';
const {createServiceProvider, deleteServiceProvider, updateServiceProvider, getServiceProvider } = serviceProvider
const {adminAuthenticate}= user

const router = express.Router();
/admin/create/serviceProvider
router.post('',adminAuthenticate,createServiceProvider);

router.delete('/admin/delete/serviceProvider',adminAuthenticate,deleteServiceProvider);

router.patch('/admin/update/serviceProvider',adminAuthenticate,updateServiceProvider);

router.get('/get/serviceProvider',getServiceProvider);

export default router;