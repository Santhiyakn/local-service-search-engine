import mongoose from "mongoose";
import { Schema } from "mongoose";

const feedBackSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    serviceProviderId: {
        type: Schema.Types.ObjectId,
        ref: 'ServiceProvider'
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        ref: 'Rating',
    },
    review: {
        type: String,
        maxlength: [100, 'Review can not be of more than 100 words'],
        ref: 'Review',
    }
},{timestamps:true});

const FeedBackModel  = mongoose.model('feedBack',feedBackSchema);

export default FeedBackModel;