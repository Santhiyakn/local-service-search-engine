
import ServiceProviderModel from '../models/serviceProviderModel.js';
import mongoose from 'mongoose';
const createServiceProvider = async (req, res) => {
    try {
        const serviceProvider = req.body;

        if (!serviceProvider) {
            return res.status(400)
                .json({
                    status: 'Error',
                    message: 'Please provide a valide information',data:[]
                });
        }

        const serviceId = await mongoose.model('service')
            .exists({ _id: serviceProvider.serviceType });

        if (!!serviceId == false) {
            return res.status(400)
                .json({
                    status: 'Error',
                    message: 'Please provide a valide service type id information',
                    data:[]
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
                    message: 'Service provider already exits with the email id',
                    data:[]
                });

        }
        if (isPhoneNoExist.length > 0) {
            return res.status(400)
                .json({
                    status: 'Error',
                    message: 'Service provider already exits with the phone number',
                    data:[]
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
            review: serviceProvider.review,
            website:serviceProvider.website
        });

        await provider.save();

        


        return res.status(201)
            .json({
                status: 'success',
                message: 'Data retrieved',
                data: [provider]
            });



    }
    catch (error) {
        return res.status(500)
            .json({ status: 'Error', message: error.message,data:[] });
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
                    message: 'Service Provider not found',
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


const updateServiceProvider = async (req, res) => {
    try {
        const id = req.query.id;
        if (!id) {
            return res.status(400)
                .json({
                    status: 'Error',
                    message: 'Id is required to update',
                    data:[]
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
                        data:[]
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


        const updatedData = await ServiceProviderModel.findByIdAndUpdate(
            id,
            updatedserviceProvider,
            { new: true, runValidators: true })


        if (updatedData.length == 0) {
            return res.status(400)
                .json({
                    status: 'Error',
                    message: 'No such Service Provider available ... Please check the id',
                    data:[]
                });
        }

        return res.status(201).json({
            status: 'success',
            message: 'Updated successfully',
            data: [updatedData]
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

function isNumeric(value) {
    return !isNaN(value) && Number.isFinite(Number(value));
  }


const getServiceProvider = async (req, res) => {
    try {
        const id = req.query.id;
        if (id) {
            const serviceProvider = await ServiceProviderModel.findById(id);
            if (serviceProvider === null) {
                return res.status(400)
                    .json({
                        status: 'Error',
                        message: 'Invalid serviceProvider Id',
                        data:[]
                    });
            }
            return res.status(201)
                .json({
                    status: 'success',
                    message: 'Updated successfully',
                    data: [serviceProvider]
                });
        }
        else {
            const page = req.headers['pagenumber'];
            const size = req.headers['pagesize'];
            const sortBy = req.query.sortBy || 'companyName';
            const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;

            if(page=='0' && size=='0')
            {
                const servicesProviders = await ServiceProviderModel.find({})
                .sort({[sortBy]:sortOrder});
            return res.status(201)
                .json({
                    status: 'success',
                    message: 'Data retrieved',
                    data: servicesProviders
                });
            }

            
    

           
            if (!isNumeric(page) || !isNumeric(size)) {
              return res.status(400).json({
                error: 'Invalid headers. pageNumber and pageSize must be a number.',
              });
            }
          
            const pageNumber = parseInt(page, 10);
            const pageSize = parseInt(size, 10);
            
            

            if (pageNumber < 1 || pageSize < 1) {
                return res.status(400)
                    .json({status: 'Error',
                         message: 'Page number and page size must be positive integers',
                         data:[]});
            }

            const limit = pageSize;
            const skip = (pageNumber * pageSize) - pageSize;
            const servicesProviders = await ServiceProviderModel.find({})
                .limit(limit)
                .skip(skip)
                .sort({[sortBy]:sortOrder});
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
                message: error.message,
                data:[]
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