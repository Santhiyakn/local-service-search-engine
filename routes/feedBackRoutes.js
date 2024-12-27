import express from 'express';
import feedBack from '../controllers/feedBackController.js';
import user from '../controllers/userController.js';
const {adminAuthenticate,authenticate}= user
const router = express.Router();
const {userEnquire,userFeedBack,deleteFeedBack,getUserFeedBack,getServiceProviderFeedBack} = feedBack;


router.delete('/admin/delete/feedback',adminAuthenticate,deleteFeedBack);  

router.post('/user/enquire',authenticate,userEnquire); 

router.post('/user/feedback',authenticate,userFeedBack); 

router.get('/user/get/feedback',authenticate,getUserFeedBack); 

router.get('/serviceProvider/get/feedback',getServiceProviderFeedBack); 


export default router;