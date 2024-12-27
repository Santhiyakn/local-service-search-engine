import { createTransport } from 'nodemailer';

const transporter = createTransport({
    service:'gmail',
    auth:{
        user:'santhiyakn01@gmail.com',
        pass:'dsuxjmkneshczzqs'
    }
})

const sendMail = async(to,subject,text)=>{
    const mailOption = {
        from:'santhiyakn01@gmail.com',
        to,
        subject,
        text
    }
    try{
        await transporter.sendMail(mailOption);
        console.log('Mail send successfully');
    }
    catch(error)
    {
        console.error('Error occurred in sending mail:',error.message);
        throw error;
    }
}

export default sendMail;