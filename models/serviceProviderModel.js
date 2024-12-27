import mongoose from 'mongoose';
import validator from 'validator';

const { isURL, isEmail } = validator;
const { isMobilePhone } = validator;
const { Schema } = mongoose;




const LocationSchema = new Schema({
    country: {
        type: String,
        required: [true, 'country is required']
    },
    state: {
        type: String,
        required: [true, 'state is required']
    },
    city: {
        type: String,
        required: [true, 'city is required']
    }
})




const WebsiteSchema = new Schema({
    website: {
        type: String,
        required: [true, 'Website is required'],
        validate: {
            validator: function (v) {
                return /^(https?:\/\/)/.test(v) && isURL(v);
            },
            message: 'Website must start with http// or https//'
        }
    }
})

const PhoneNumberSchema = new Schema({
    phoneNumber:{
        type: String,
        required: [true, 'Phone number is required'],
        validate: {
            validator: function (v) {
                return isMobilePhone(v, null, { strictMode: false });
            },
            message: props => `${props.value} is not a valid phone number!`
        }

    }
})



const PhotoSchema = new Schema({
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
});




const ServiceProviderSchema = new Schema({
    companyName: {
        type: String,
        unique: true,
        required: [true, 'company name is required'],

    },
    serviceProviderName: {
        type: String,
        required: [true, 'serviceProviderName is required']
    },
    phoneNumber: PhoneNumberSchema,
    location: LocationSchema,
    locationAvailable: {
        type: [String],
        required: [true, 'locationAvailable is required'],
        validate: {
            validator: function (arr) {
                return arr.every(str => typeof str === 'string' && str.trim().length > 0);
            },
            message: 'All locations must be non-empty strings.',
        },
    },
    serviceType: Schema.Types.ObjectId,
    serviceDescription: {
        type: String,
        maxlength: [100, 'Description can not be of more than 100 words']
    },
    photo: PhotoSchema,
    email: {
        type: String,
        required: [true, 'email is required'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please provide a valid email address.'],
    },
    website: WebsiteSchema

}, { timestamps: true });



const ServiceProviderModel = mongoose.model('ServiceProvider', ServiceProviderSchema);

export default ServiceProviderModel;