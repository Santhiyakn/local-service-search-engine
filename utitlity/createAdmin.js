import UserModel from '../models/userModel.js';
import { hash } from 'bcrypt';

const createAdmin =async() =>{

    try{
    const adminExist = await UserModel.find({role:'admin'});
    if(adminExist.length>0)
    {
        console.log('Admin adready exists');
        return;
    }

    const  admin = new UserModel ({
        name:'Santhiya',
        email:'santhiyakn01@gmail.com',
        password:'Admin2002',
        role:'admin',
        isVerified:true
        
    });

    await admin.save();
    console.log('Admin create successfully');
    return;
}
catch(error)
{
    console.log(error);
    return;
}

    
}

export default createAdmin;