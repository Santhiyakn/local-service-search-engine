import express, { json, urlencoded } from 'express';
const app = express();
import dotenv from 'dotenv';
dotenv.config();
import {connectDb} from './models/db.js';
connectDb();
const port = process.env.PORT ||8000;

import cors from 'cors';

import  serviceRoutes from './routes/serviceRoutes.js';
import  serviceProviderRoutes from './routes/serviceProviderRoutes.js';
import  userRoutes from './routes/userRoutes.js';
import feedBackRoutes from './routes/feedBackRoutes.js';

app.use(cors());
app.use(json());
app.use(urlencoded({extended:true}));


app.get('/',(req,res)=>{
    res.send("Welcome home");
});




app.use('/api',serviceRoutes);

app.use('/api',serviceProviderRoutes);

app.use('/api',userRoutes);

app.use('/api',feedBackRoutes);



app.listen(port,console.log(`Server is running on port ${port}`));

console.log('hello');