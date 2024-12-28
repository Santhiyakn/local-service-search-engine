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
                    message: 'Please provide the userId ,serviceProviderId  and question ',
                    data:[]
                });
        }
        if(enquireQuestion.length>100 || enquireQuestion.length<10)
        {
            return res.status(400)
                .json({
                    status: 'Error',
                    message: 'Please provide the valid enquireQuestion ',
                    data:[]
                });
        }
        const user = await UserModel.findById(userId);
        if (user === null) {
            return res.status(400)
                .json({
                    status: 'Error',
                    message: 'Please provide the valid userId ',
                    data:[]
                });

        }
        const serviceProvider = await ServiceProviderModel.findById(serviceProviderId);
        if (serviceProvider === null) {
            return res.status(400)
                .json({
                    status: 'Error',
                    message: 'Please provide the valid serviceProvideId ',
                    data:[]
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
            data: [enquires],
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

const userFeedBack = async (req, res) => {
    try {

        const { userId, serviceProviderId, rating, review } = req.body;

        if (!userId || !serviceProviderId || !rating) {
            return res.status(400)
                .json({
                    status: 'Error',
                    message: 'Please provide the userId ,serviceProviderId  and rating ',
                    data:[]
                });
        }

        const user = await UserModel.findById(userId);
        if (!user || !user.enquries || user.enquries.length === 0) {
            return res.status(404).json({
                status: 'Error',
                message: 'User or enquiries not found',
                data:[]
            });
        }
        const serviceProvider = await ServiceProviderModel.findById(serviceProviderId);
        if (serviceProvider === null) {
            return res.status(400)
                .json({
                    status: 'Error',
                    message: 'Please provide the valid serviceProvideId ',
                    data:[]
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
                data:[]
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
            data: [Userfeedback]
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


const deleteFeedBack = async (req, res) => {
    try {
        if (!req.query.id) {
            return res.status(400).json({
                status: 'Error',
                message: 'feedBack id is required',
                data:[]
            });
        }
        const id = req.query.id;

        const deletedFeedBack = await FeedBackModel.findByIdAndDelete(id);
        if (deletedFeedBack == null) {
            return res.status(400)
                .json({
                    status: 'Error',
                    message: 'FeedBack not found',
                    data:[]
                });
        }
        return res.status(201).json({
            status: 'success',
            message: 'Feedback  is deleted',
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

const getUserFeedBack = async (req, res) => {
    try {
        if (!req.query.id) {
            return res.status(400).json({
                status: 'Error',
                message: 'user id is required',
                data:[]
            });
        }
        const userId = req.query.id;
        const user  = await UserModel.findById(userId);
        if(user==null)
        {
            return res.status(400)
            .json({
                status: 'Error',
                message: 'Invalid userId',
                data:[]
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
                message: error.message,
                data:[]
            });
    }

}


const getServiceProviderFeedBack = async (req, res) => {

    try {
        if (!req.query.id) {
            return res.status(400).json({
                status: 'Error',
                message: 'serviceProvider id is required',
                data:[]
            });
        }
        const serviceProviderId = req.query.id;
        const serviceProvider = await ServiceProviderModel.findById(serviceProviderId);
        if(serviceProvider==null)
        {
            return res.status(400).json({
                status: 'Error',
                message: 'serviceProvider id Invlid',
                data:[]
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
                message: error.message,
                data:[]
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