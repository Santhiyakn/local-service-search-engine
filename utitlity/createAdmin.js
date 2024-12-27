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
        isVerified:true,
        photo:"https://www.iconpacks.net/icons/1/free-user-icon-295-thumb.png"
        
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