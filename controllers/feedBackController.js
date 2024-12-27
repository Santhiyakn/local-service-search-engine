import FeedBackModel from "../models/feedBackModel.js";
import UserModel from "../models/userModel.js";
import ServiceProviderModel from "../models/serviceProviderModel.js";
import sendMail from "../utitlity/mail.js";

const userEnquire = async (req, res) => {
    try {
        const { userId, serviceProviderId, enquireQuestion } = req.body;
        if (!userId || !serviceProviderId || !enquireQuestion) {
            return res.status(400)
                .json({
                    status: 'Error',
                    message: 'Please provide the userId ,serviceProviderId  and question '
                });
        }
        if(enquireQuestion.length>100 || enquireQuestion.length<10)
        {
            return res.status(400)
                .json({
                    status: 'Error',
                    message: 'Please provide the valid enquireQuestion '
                });
        }
        const user = await UserModel.findById(userId);
        if (user === null) {
            return res.status(400)
                .json({
                    status: 'Error',
                    message: 'Please provide the valid userId '
                });

        }
        const serviceProvider = await ServiceProviderModel.findById(serviceProviderId);
        if (serviceProvider === null) {
            return res.status(400)
                .json({
                    status: 'Error',
                    message: 'Please provide the valid serviceProvideId '
                });

        }
        await sendMail(serviceProvider.email, ' Enquire mail from LSSEMS', `
        Equire mail from the  ${user.name} :
        The enquire question is:${enquireQuestion}.
        Please make sure to reply:${user.email}`);
        const enquires = await UserModel.findByIdAndUpdate(userId,
            {
                $push: {
                    enquries: [{
                        serviceProviderId: serviceProviderId,
                        enquiryDate: Date.now()
                    }]
                }
            })


        return res.status(201).json({
            status: 'Success',
            message: 'Enquire mail is send successfully',
            data: enquires
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

const userFeedBack = async (req, res) => {
    try {

        const { userId, serviceProviderId, rating, review } = req.body;

        if (!userId || !serviceProviderId || !rating) {
            return res.status(400)
                .json({
                    status: 'Error',
                    message: 'Please provide the userId ,serviceProviderId  and rating '
                });
        }

        const user = await UserModel.findById(userId);
        if (!user || !user.enquries || user.enquries.length === 0) {
            return res.status(404).json({
                status: 'Error',
                message: 'User or enquiries not found'
            });
        }
        const serviceProvider = await ServiceProviderModel.findById(serviceProviderId);
        if (serviceProvider === null) {
            return res.status(400)
                .json({
                    status: 'Error',
                    message: 'Please provide the valid serviceProvideId '
                });

        }
        const twoDaysAfter = new Date();
        twoDaysAfter.setDate(twoDaysAfter.getDate() + 2);
        const matchedEnquiry = user.enquries.find(
            (enqurie) =>
                enqurie?.serviceProviderId?.toString() === serviceProviderId &&
                new Date(enqurie?.enquiryDate) < twoDaysAfter
        );

        if (!matchedEnquiry) {
            return res.status(400).json({
                status: 'Error',
                message: 'No valid enquiry found to leave feedback for this service provider',
            });
        }
        const Userfeedback = new FeedBackModel({
            userId: userId,
            serviceProviderId: serviceProviderId,
            rating: rating,
            review: review,
        });

        await Userfeedback.save();
        return res.status(201).json({
            status: 'success',
            message: 'Review is added',
            data: Userfeedback
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


const deleteFeedBack = async (req, res) => {
    try {
        if (!req.query.id) {
            return res.status(400).json({
                status: 'Error',
                message: 'feedBack id is required'
            });
        }
        const id = req.query.id;

        const deletedFeedBack = await FeedBackModel.findByIdAndDelete(id);
        if (deletedFeedBack == null) {
            return res.status(400)
                .json({
                    status: 'Error',
                    message: 'FeedBack not found'
                });
        }
        return res.status(201).json({
            status: 'success',
            message: 'Feedback  is deleted'
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

const getUserFeedBack = async (req, res) => {
    try {
        if (!req.query.id) {
            return res.status(400).json({
                status: 'Error',
                message: 'user id is required'
            });
        }
        const userId = req.query.id;
        const user  = await UserModel.findById(userId);
        if(user==null)
        {
            return res.status(400)
            .json({
                status: 'Error',
                message: 'Invalid userId'
            });
        }
        const userFeedBack = await FeedBackModel.find({ userId: userId });
        return res.status(201).json({
            status: 'Sucess',
            message: 'User Feedbacks are retrieved',
            data: userFeedBack
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


const getServiceProviderFeedBack = async (req, res) => {

    try {
        if (!req.query.id) {
            return res.status(400).json({
                status: 'Error',
                message: 'serviceProvider id is required'
            });
        }
        const serviceProviderId = req.query.id;
        const serviceProvider = await ServiceProviderModel.findById(serviceProviderId);
        if(serviceProvider==null)
        {
            return res.status(400).json({
                status: 'Error',
                message: 'serviceProvider id Invlid'
            });
        }
        const serviceProviderFeedBack = await FeedBackModel.find({ serviceProviderId: serviceProviderId });
        return res.status(201).json({
            status: 'Success',
            message: ' serviceProvider are retrieved',
            data: serviceProviderFeedBack
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



const feedBack = {
    userEnquire,
    userFeedBack,
    deleteFeedBack,
    getUserFeedBack,
    getServiceProviderFeedBack
};

export default feedBack;