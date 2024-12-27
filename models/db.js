import mongoose from 'mongoose';
import createAdmin from '../utitlity/createAdmin.js';


export const connectDb =async()=>{
    // const ServiceProvider = mongoose.model('ServiceProvider', );
await mongoose.connect('mongodb://127.0.0.1:27017/lssems-DataBase').then(async() => {
    console.log('Connected to database');
    // await ServiceProvider.collection.dropIndex('phoneNumber_1');
    await createAdmin();

    }).catch((error) => {
    console.log(error);
})
    
}


