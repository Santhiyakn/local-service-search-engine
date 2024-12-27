import mongoose from 'mongoose'; 
const { Schema } = mongoose;

const ServiceSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Service name is required']
    }
},{timestamps:true});

const ServiceModel = mongoose.model('service', ServiceSchema);

export default ServiceModel;