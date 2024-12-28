import ServiceProviderModel from '../models/serviceProviderModel.js';
import mongoose from 'mongoose';
const createServiceProvider = async (req, res) => {
    try {
        const serviceProvider = req.body;

        if (!serviceProvider) {
            return res.status(400)
                .json({
                    status: 'Error',
                    message: 'Please provide a valide information'
                });
        }

        const serviceId = await mongoose.model('service')
            .exists({ _id: serviceProvider.serviceType });

        if (!!serviceId == false) {
            return res.status(400)
                .json({
                    status: 'Error',
                    message: 'Please provide a valide service type id information',
                });
        }

        const isEmailExist = await ServiceProviderModel
            .find({ email: serviceProvider.email });
        const isPhoneNoExist = await ServiceProviderModel
            .find({ phoneNumber: serviceProvider.phoneNumber });
        
        if (isEmailExist.length > 0) {
            return res.status(400)
                .json({
                    status: 'Error',
                    message: 'Service provider already exits with the email id'
                });

        }
        if (isPhoneNoExist.length > 0) {
            return res.status(400)
                .json({
                    status: 'Error',
                    message: 'Service provider already exits with the phone number'
                });
        }
        

        const provider = new ServiceProviderModel({
            companyName: serviceProvider.companyName,
            serviceProviderName: serviceProvider.serviceProviderName,
            phoneNumber: serviceProvider.phoneNumber,
            location: serviceProvider.location,
            locationAvailable: serviceProvider.locationAvailable,
            serviceType: serviceProvider.serviceType,
            serviceDescription: serviceProvider.serviceDescription,
            photo: { photo: serviceProvider.photo },
            email: serviceProvider.email,
            rating: serviceProvider.rating,
            review: serviceProvider.review
        });

        await provider.save();

        


        return res.status(201)
            .json({
                status: 'success',
                message: 'Data retrieved',
                data: provider
            });



    }
    catch (error) {
        return res.status(500)
            .json({ status: 'Error', message: error.message });
    }


}


const deleteServiceProvider = async (req, res) => {
    try {
        const id = req.query.id;
        if (!id) {
            return res.status(400)
                .json({
                    status: 'Error',
                    message: 'Service Provider id is required'
                });
        }
        const isDeleted = await ServiceProviderModel.findByIdAndDelete(id);

        if (isDeleted == null) {
            return res.status(400)
                .json({
                    status: 'Error',
                    message: 'Service Provider not found'
                });
        }
        return res.status(201).json({
            status: 'success',
            message: 'Deleted successfully'
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


const updateServiceProvider = async (req, res) => {
    try {
        const id = req.query.id;
        if (!id) {
            return res.status(400)
                .json({
                    status: 'Error',
                    message: 'Id is required to update'
                });
        }
        const updatedserviceProvider = req.body;
        if (updatedserviceProvider.serviceId) {
            const serviceId = await mongoose.model('service')
                .exists({ _id: updatedserviceProvider.serviceType });

            if (!!serviceId == false) {
                return res.status(400)
                    .json({
                        status: 'Error',
                        message: 'Please provide a valide service type id information',
                    });
            }
        }

        if (updatedserviceProvider.email) {
            const isEmailExist = await ServiceProviderModel
                .find({ email: updatedserviceProvider.email });

            if (isEmailExist.length > 0) {
                return res.status(400)
                    .json({
                        status: 'Error',
                        message: 'Service provider already exits with the email id'
                    });

            }

        }

        if (updatedserviceProvider.phoneNumber) {
            const isPhoneNoExist = await ServiceProviderModel
                .find({ phoneNumber: serviceProvider.phoneNumber });
            if (isPhoneNoExist.length > 0) {
                return res.status(400)
                    .json({
                        status: 'Error',
                        message: 'Service provider already exits with the phone number'
                    });
            }
        }

       if(updatedserviceProvider.locationAvailable)
       {
           const locations =updatedserviceProvider.locationAvailable;
           await ServiceProviderModel.findByIdAndUpdate(
            id,
            {
                $addToSet: {
                    locationAvailable: { $each: locations },
                },
            }
        )
        updatedserviceProvider.locationAvailable=undefined;
        }

        if(updatedserviceProvider.photo)
        {
            await ServiceProviderModel.findByIdAndUpdate(
                id,{photo:{photo:updatedserviceProvider.photo}}
            )
            updatedserviceProvider.photo = undefined;
        }

        const sanitizedData = Object.fromEntries(
            Object.entries(updatedserviceProvider).filter(([_, value]) => value !== undefined)
        );

        const updatedData = await ServiceProviderModel.findByIdAndUpdate(
            id,
            sanitizedData,
            { new: true, runValidators: true })


        if (updatedData.length == 0) {
            return res.status(400)
                .json({
                    status: 'Error',
                    message: 'No such Service Provider available ... Please check the id'
                });
        }

        return res.status(201).json({
            status: 'success',
            message: 'Updated successfully',
            data: updatedData
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


const getServiceProvider = async (req, res) => {
    try {
        const id = req.body.id;
        if (id) {
            const serviceProvider = await ServiceProviderModel.findById(id);
            if (serviceProvider === null) {
                return res.status(400)
                    .json({
                        status: 'Error',
                        message: 'Invalid serviceProvider Id'
                    });
            }
            return res.status(201)
                .json({
                    status: 'success',
                    message: 'Updated successfully',
                    data: serviceProvider
                });
        }
        else {
            const pageNumber = req.body.pageNumber;
            const pageSize = req.body.pageSize;
            const sort = req.body.sort;

            if (pageNumber < 1 || pageSize < 1) {
                return res.status(400)
                    .json({ message: 'Page number and page size must be positive integers' });
            }

            const limit = pageSize;
            const skip = (pageNumber * pageSize) - pageSize;
            const servicesProviders = await ServiceProviderModel.find({})
                .limit(limit)
                .skip(skip)
                .sort(sort);
            return res.status(201)
                .json({
                    status: 'success',
                    message: 'Data retrieved',
                    data: servicesProviders
                });
        }
    }

    catch (error) {
        return res.status(500)
            .json({
                status: 'Error',
                message: error.message
            });
    }


}

const serviceProvider = {
    createServiceProvider,
    deleteServiceProvider,
    updateServiceProvider,
    getServiceProvider
}

export default serviceProvider; 