import mongoose from 'mongoose';
import createAdmin from '../utitlity/createAdmin.js';
import dotenv from 'dotenv';
dotenv.config();


export const connectDb =async()=>{
    
await mongoose.connect(process.env.MONGO_URI ).then(async() => {
    console.log('Connected to database');
    await createAdmin();

    }).catch((error) => {
    console.log(error);
})
    
}


