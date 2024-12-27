import express from 'express';
import user from '../controllers/userController.js';

const { signUp, verifyOtp, logIn,AdminLogin, updateUser, logOut ,authenticate,getUser,deleteUser,adminAuthenticate} =user;


const router = express.Router();

router.post('/user/signUp',signUp);

router.post('/user/verfiy/Otp',verifyOtp);

router.post('/user/login',logIn);

router.post('/user/logout',logOut);

router.post('/user/update',authenticate,updateUser); 

router.delete('/admin/user/delete',adminAuthenticate,deleteUser);        

router.get('/admin/user/get',getUser); 

router.post('/admin/login',AdminLogin);







export default router;