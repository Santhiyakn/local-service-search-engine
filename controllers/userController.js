import UserModel from '../models/userModel.js';
import bcrypt from 'bcrypt';
import generateOTP from '../utitlity/otp.js';
import sendMail from '../utitlity/mail.js';
import jsonwebtoken from 'jsonwebtoken';
const { sign, verify } = jsonwebtoken;
const { hash, compare, genSalt } = bcrypt;
import dotenv from 'dotenv';
dotenv.config();


const tokenblacklist = new Set();

const signUp = async (req, res) => {
    try {
        const { email, password } = req.body;

        const isUserExists = await UserModel.findOne({ email: email });


        if (isUserExists) {
            return res.status(400).json({
                status: 'Error',
                message: 'User already exists',
                data:[]
            });
        }


        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        const hashotp = await hash(otp, 10);

        const newUser = new UserModel({
            name: req.body.name,
            email: email,
            phoneNumber: req.body.phoneNumber,
            password: password,
            photo: "https://www.iconpacks.net/icons/1/free-user-icon-295-thumb.png",
            otp: hashotp,
            otpExpires: otpExpires,
            isVerified: false
        })

        await newUser.save();

        await sendMail(email,
            'Email verification mail',
            `Email Verification mail:To sign up to LSSEMS use this otp :${otp}`
        );
        return res.status(201).json({
            status: 'success',
            message: 'Verification mail is send to your email,Please enter the otp',
            data:[newUser]
        })
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400)
                .json({ status: 'Error', message: error.message,data:[] });
        }
        return res.status(500)
            .json({
                status: 'Error',
                message: error.message,data:[]
            });
    }
}


const verifyOtp = async (req, res) => {

    try {
        const { email, otp } = req.body;
        const VierifyUser = await UserModel.findOne({ email: email });
        if (!VierifyUser) {
            return res.status(400).json({
                status: 'Error',
                message: 'User does not  exists',
                data:[]
            });
        }

        if (VierifyUser.otpExpires < new Date()) {
            return res.status(400).json({
                status: 'Error',
                message: 'Otp expired',
                data:[]
            });
        }

        const isVaildOpt = await compare(otp, VierifyUser.otp);


        if (!isVaildOpt) {
            return res.status(400).json({
                status: 'Error',
                message: 'Provide valid otp',
                data:[]
            });
        }
        VierifyUser.isVerified = true;
        VierifyUser.otp = undefined;
        VierifyUser.otpExpires = undefined;

        await VierifyUser.save();

        return res.status(201).json({
            status: 'Error',
            messgae: "Email verfied successfully",
            data:[]
        });
    }
    catch (error) {
        return res.status(500)
            .json({
                status: 'Error',
                message: error.message,
                data:[]
            });
    }


}


const logIn = async (req, res) => {

    try {
        const { email, password } = req.body;
        const userLogin = await UserModel.findOne({ email: email });


        if (!userLogin) {
            return res.status(400).json({
                status: 'Error',
                message: 'User does not  exists',
                data:[]
            });
        }
        const user = await UserModel.findById(userLogin.id);
        if (!user.isVerified) {
            return res.status(403).json({
                status: 'Error',
                message: 'Not a verified user',
                data:[]
            })
        }
        const verfiyPassword = await compare(password, userLogin.password);
        if (!verfiyPassword) {
            return res.status(400).json({
                status: 'Error',
                message: 'Incorrect password',
                data:[]
            });
        }
        const token = sign({ id: userLogin.id }, process.env.JWT_SECRET, { expiresIn: '24hr' });
        return res.status(201).json({
            id: userLogin.id,
            status: "success",
            message: "Login successful",
            data: [userLogin],
            token,
        });
    }
    catch (error) {
        return res.status(500)
            .json({
                status: 'Error',
                message: error.message,
                data:[]
            });
    }


}



const authenticate = async(req, res, next) => {
    try {
        const token = req.header('Authorization');
        if (!token) {
            return res.status(400).json({
                status: 'Error',
                message: 'Access denied',
                data:[]
            });
        }

        const actualToken = token.split(' ')[1];
        if (tokenblacklist.has(actualToken)) {
            return res.status(402).json({
                status: 'Error',
                message: 'Token  invalid. Please log in again.',
                data:[]
            });
        }
        const verifyToken = verify(actualToken, process.env.JWT_SECRET);
        const user = await UserModel.findById(verifyToken.id);

        req.userToken = verifyToken;
        next();

    }
    catch (error) {
        return res.status(500)
            .json({
                status: 'Error',
                message: error.message
            });
    }

}


const adminAuthenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization');
        if (!token) {
            return res.status(400).json({
                status: 'Error',
                message: 'Access denied',
                data:[]
            });
        }

        const actualToken = token.split(' ')[1];
        if (tokenblacklist.has(actualToken)) {
            return res.status(402).json({
                status: 'Error',
                message: 'Token  invalidated. Please log in again.',
                data:[]
            });
        }
        const verifyToken = verify(actualToken, process.env.JWT_SECRET);
        const admin = await UserModel.find({ role: 'admin' });
        if (admin[0].id != verifyToken.id  ) {
            return res.status(400).json({
                status: 'Error',
                message: 'Invalid token (not admin token)',
                data:[]
            })
        }

        req.adminToken = verifyToken;
        next();

    }
    catch (error) {
        return res.status(500)
            .json({
                status: 'Error',
                message: error.message,
                data:[]
            });
    }

}


const updateUser = async (req, res) => {
    if (!req.query.id) {
        return res.status(400).json({
            status: 'Error',
            message: 'Id not found',
            data:[]
        });
    }
    try {


        const id = req.query.id;

        const user = await UserModel.findById(id);

        if (user === null) {
            return res.status(400).json({
                status: 'Error',
                message: 'User not found - Invalid Id',
                data:[]
            });
        }

        const updatedData = req.body;

        const sanitizedData = Object.fromEntries(
            Object.entries(updatedData).filter(([_, value]) => value !== undefined)
        );

        if (sanitizedData.role) {
            return res.status(400).json({
                status: 'Error',
                message: 'role cannot be updated',
                data:[]
            });
        }


        if (sanitizedData.email) {
            return res.status(400).json({
                status: 'Error',
                message: 'Email cannot be updated',
                data:[]
            });
        }

        if (sanitizedData.password) {
            if (sanitizedData.password.length > 15
                || sanitizedData.password.length < 8) {
                    return res.status(400).json({
                        status: 'Error',
                        message: 'Password exceeds maximum allowed length of 15 characters or less than 8 characters',
                        data:[]
                        
                    });
               
            }
            const salt = await genSalt(10);
            sanitizedData.password = await hash(sanitizedData.password, salt);
        }


        const updatedUser = await UserModel.findByIdAndUpdate(id,
            sanitizedData, { new: true, runValidators: true });


        if (updatedUser.length == 0) {
            return res.status(400)
                .json({
                    status: 'Error',
                    message: 'User not found',
                    data:[]
                });
        }
        return res.status(201)
            .json({
                status: 'success',
                message: 'User profile updated successfully',
                data: [updatedUser]
            });
    }
    catch (error) {
        return res.status(500)
            .json({
                status: 'Error',
                message: error.message,
                data:[]
            });
    }


}

const logOut =async (req, res) => {
    try {
        const token = req.header('Authorization');
        if (!token || !token.startsWith('Bearer ')) {
            return res.status(400)
                .json({
                    status: 'Error',
                    message: 'No token found',
                    data:[]
                });
        }
        const actualToken = token.split(' ')[1];
        tokenblacklist.add(actualToken);
        return res.status(201).json({
            status: 'success',
            message: 'Logged out successfully',
            data:[]
        });
    }
    catch (error) {
        return res.status(500)
            .json({
                status: 'Error',
                message: error.message,
                data:[]
            });
    }
}


const AdminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await UserModel.findOne({ role: "admin" });
        const verfiyPassword = await compare(password, admin.password);
        if (admin.email != email) {
            return res.status(400)
                .json({
                    status: 'Error',
                    message: 'Admin EmailId is invalid',
                    data:[]
                });
        }
        if (!verfiyPassword) {
            return res.status(400)
                .json({
                    status: 'Error',
                    message: 'Admin Password is invalid',
                    data:[]
                });
        }
        const token = sign({ id: admin.id }, process.env.JWT_SECRET, { expiresIn: '1hr' });
        await UserModel.findByIdAndUpdate(admin.id,{logIn:true}, { new: true, runValidators: true });
        return res.status(201).json({
            status: "success",
            message: "Admin Login successful",
            data:[token],
        });
    }
    catch (error) {
        return res.status(500)
            .json({
                status: 'Error',
                message: error.message
            });
    }

}

const getUser = async (req, res) => {

    try {
        if (req.query.id) {
            const id = req.query.id;
            const userDetail = await UserModel.findById(id);
            if (userDetail == null) {
                return res.status(400).json({
                    status: 'Error',
                    message: 'User is not found ',
                    data:[]
                })
            }
            return res.status(201).json({
                status: "success",
                message: "Data retrieved successfully",
                data: [userDetail],
            });
        }
        const users = await UserModel.find({});
        return res.status(201).json({
            status: "success",
            message: "Data retrieved successfully",
            data: users,
        });

    }
    catch (error) {
        return res.status(500)
            .json({
                status: 'Error',
                message: error.message,
                data:[]
            });
    }
}


const deleteUser = async (req, res) => {
    try {
        if (!req.query.id) {
            return res.status(400)
                .json({
                    status: 'Error',
                    message: 'id is required to delete',
                    data:[]
                });
        }
        const id = req.query.id;
        const deleteUserProfile = await UserModel.findByIdAndDelete(id);
        if (deleteUserProfile == null) {
            return res.status(400)
                .json({
                    status: 'Error',
                    message: 'Invalid user id',
                    data:[]
                });

        }
        return res.status(201).json({
            status: 'success',
            message: 'Deleted successfully',
            data:[]
        });

    }
    catch (error) {
        return res.status(500)
            .json({
                status: 'Error',
                message: error.message,
                data:[]
            });
    }
}






const user =
{
    signUp,
    verifyOtp,
    logIn,
    authenticate,
    updateUser,
    logOut,
    getUser,
    AdminLogin,
    deleteUser,
    adminAuthenticate
};



export default user;




