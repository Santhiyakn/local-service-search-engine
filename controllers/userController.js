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
                message: 'User already exists'
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
            message: 'Verification mail is send to your email,Please enter the otp'
        })
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400)
                .json({ status: 'Error', message: error.message });
        }
        return res.status(500)
            .json({
                status: 'Error',
                message: error.message
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
                message: 'User does not  exists'
            });
        }

        if (VierifyUser.otpExpires < new Date()) {
            return res.status(400).json({
                status: 'Error',
                message: 'Otp expired'
            });
        }

        const isVaildOpt = await compare(otp, VierifyUser.otp);


        if (!isVaildOpt) {
            return res.status(400).json({
                status: 'Error',
                message: 'Provide valid otp'
            });
        }
        VierifyUser.isVerified = true;
        VierifyUser.otp = undefined;
        VierifyUser.otpExpires = undefined;

        await VierifyUser.save();

        return res.status(201).json({
            status: 'Error',
            messgae: "Email verfied successfully",
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


const logIn = async (req, res) => {

    try {
        const { email, password } = req.body;
        const userLogin = await UserModel.findOne({ email: email });


        if (!userLogin) {
            return res.status(400).json({
                status: 'Error',
                message: 'User does not  exists'
            });
        }
        const user = await UserModel.findById(userLogin.id);
        if (!user.isVerified) {
            return res.status(403).json({
                status: 'Error',
                message: 'Not a verified user'
            })
        }
        const verfiyPassword = await compare(password, userLogin.password);
        if (!verfiyPassword) {
            return res.status(400).json({
                status: 'Error',
                message: 'Incorrect password'
            });
        }
        const token = sign({ id: userLogin.id }, process.env.JWT_SECRET, { expiresIn: '24hr' });
        return res.status(201).json({
            id: userLogin.id,
            status: "success",
            message: "Login successful",
            data: userLogin,
            token,
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



const authenticate = async(req, res, next) => {
    try {
        const token = req.header('Authorization');
        if (!token) {
            return res.status(400).json({
                status: 'Error',
                message: 'Access denied'
            });
        }

        const actualToken = token.split(' ')[1];
        if (tokenblacklist.has(actualToken)) {
            return res.status(402).json({
                status: 'Error',
                message: 'Token  invalid. Please log in again.'
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
                message: 'Access denied'
            });
        }

        const actualToken = token.split(' ')[1];
        if (tokenblacklist.has(actualToken)) {
            return res.status(402).json({
                status: 'Error',
                message: 'Token  invalidated. Please log in again.'
            });
        }
        const verifyToken = verify(actualToken, process.env.JWT_SECRET);
        const admin = await UserModel.find({ role: 'admin' });
        if (admin[0].id != verifyToken.id  ) {
            return res.status(400).json({
                status: 'Error',
                message: 'Invalid token (not admin token)'
            })
        }

        req.adminToken = verifyToken;
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


const updateUser = async (req, res) => {
    if (!req.query.id) {
        return res.status(400).json({
            status: 'Error',
            message: 'Id not found'
        });
    }
    try {


        const id = req.query.id;

        const user = await UserModel.findById(id);

        if (user === null) {
            return res.status(400).json({
                status: 'Error',
                message: 'User not found - Invalid Id'
            });
        }

        const updatedData = req.body;

        const sanitizedData = Object.fromEntries(
            Object.entries(updatedData).filter(([_, value]) => value !== undefined)
        );

        if (sanitizedData.role) {
            return res.status(400).json({
                status: 'Error',
                message: 'role cannot be updated'
            });
        }


        if (sanitizedData.email) {
            return res.status(400).json({
                status: 'Error',
                message: 'Email cannot be updated'
            });
        }

        if (sanitizedData.password) {
            if (sanitizedData.password.length > 15
                || sanitizedData.password.length < 8) {
                    return res.status(400).json({
                        status: 'Error',
                        message: 'Password exceeds maximum allowed length of 15 characters or less than 8 characters'
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
                    message: 'User not found'
                });
        }
        return res.status(201)
            .json({
                status: 'success',
                message: 'User profile updated successfully',
                data: updatedUser
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

const logOut =async (req, res) => {
    try {
        const token = req.header('Authorization');
        if (!token || !token.startsWith('Bearer ')) {
            return res.status(400)
                .json({
                    status: 'Error',
                    message: 'No token found'
                });
        }
        const actualToken = token.split(' ')[1];
        tokenblacklist.add(actualToken);
        return res.status(201).json({
            status: 'success',
            message: 'Logged out successfully'
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


const AdminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await UserModel.findOne({ role: "admin" });
        const verfiyPassword = await compare(password, admin.password);
        if (admin.email != email) {
            return res.status(400)
                .json({
                    status: 'Error',
                    message: 'Admin EmailId is invalid'
                });
        }
        if (!verfiyPassword) {
            return res.status(400)
                .json({
                    status: 'Error',
                    message: 'Admin Password is invalid'
                });
        }
        const token = sign({ id: admin.id }, process.env.JWT_SECRET, { expiresIn: '1hr' });
        await UserModel.findByIdAndUpdate(admin.id,{logIn:true}, { new: true, runValidators: true });
        return res.status(201).json({
            id: admin.id,
            status: "success",
            message: "Admin Login successful",
            token,
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
                    message: 'User is not found '
                })
            }
            return res.status(201).json({
                status: "success",
                message: "Data retrieved successfully",
                data: userDetail,
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
                message: error.message
            });
    }
}


const deleteUser = async (req, res) => {
    try {
        if (!req.query.id) {
            return res.status(400)
                .json({
                    status: 'Error',
                    message: 'id is required to delete'
                });
        }
        const id = req.query.id;
        const deleteUserProfile = await UserModel.findByIdAndDelete(id);
        if (deleteUserProfile == null) {
            return res.status(400)
                .json({
                    status: 'Error',
                    message: 'Invalid user id'
                });

        }
        return res.status(201).json({
            status: 'success',
            message: 'Deleted successfully',
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




