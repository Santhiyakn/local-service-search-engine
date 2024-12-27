import mongoose from 'mongoose'; 
import validator from 'validator';
import { genSalt, hash } from 'bcrypt';
const { Schema } = mongoose;
const { isMobilePhone ,isEmail}=validator;

const userSchema =new Schema({
    role: {
        type: String,
        enum: ['user', 'admin'], 
        default: 'user', 
    },
    name: {
        type: String,
        required: [true, 'User name is required']
    },
    email:{
        type: String,
        required: [true, 'email is required'],
        lowercase: true,
        validate: [isEmail, 'Please provide a valid email address.'],
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    phoneNumber: {
        type: String,
        validate: {
            validator: function (v) {
                return isMobilePhone(v, null, { strictMode: false });
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    photo: {
        type: String,
        required: [true, 'Photo is required.'],
        validate: {
            validator: function (v) {
                return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(v);
            },
            message: props => `${props.value} is not a valid image file! Only jpg, jpeg, png, gif, bmp, or webp are allowed.`,
        },
    },
    enquries: [{
        serviceProviderId: { type: Schema.Types.ObjectId, ref: 'ServiceProvider' },
        enquiryDate: { type: Date, default: Date.now },
    }],
    otp: {
        type: String
    },
    otpExpires: {
        type: Date
    },
    isVerified: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

userSchema.pre('save', async function (next) {
    try {
        const user = this;
        if (!user.isModified('password')) {
            return next();
        }
        if (user.password.length > 15 && user.password.length < 8) {
            throw new Error('Password exceeds maximum allowed length of 15 characters or less than 8 characters');
        }
        const salt = await genSalt(10);

        user.password = await hash(user.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});





const UserModel = mongoose.model('User', userSchema);

export default UserModel;