import ServiceModel from '../models/serviceModel.js';




const createService = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400)
                .json({ 
                    status: 'Error', 
                    message: 'Service name is required',
                    data:[]
                 });
        }
        const isExists = await ServiceModel.find({ name: name });
        if (isExists.length > 0) {
            return res.status(400)
                .json({ 
                    status: 'Error', 
                    message: 'Service already exist',
                    data:[] });

        }
        const service_type = new ServiceModel({
            name: name
        })

        await service_type.save();

        return res.status(201)
            .json({ 
                
                status: 'success', 
                message: 'Service  is created',
                data:[service_type] });

    }
    catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400)
                .json({ status: 'Error', message: error.message,data:[] });
        }
        return res.status(500)
            .json({ status: 'Error', message: error.message,data:[] });
    }
}



const getService = async (req, res) => {
    try {
        const id = req.query.id;
        if (id) {
            const services = await ServiceModel.findById(id);
            if(services===null)
            {
                return res.status(400)
                .json({ status: 'Error', message: 'Invalid Service Id',data:[] });
            }
            return res.status(200)
                .json({
                    status: 'Success',
                    message: 'Data retrieved',
                    data: [services]
                });
        }
        if(!id) {
            const pageNumber = req.body.pageNumber;
            const pageSize = req.body.pageSize;
            const sort = req.body.sort;

            if (pageNumber < 1 || pageSize < 1) {
                return res.status(400)
                .json({ status: 'Error',
                     message: 'Page number and page size must be positive integers',
                     data:[]
                    });
            }

            const limit = pageSize;
            const skip = (pageNumber * pageSize) - pageSize;
            const services = await ServiceModel.find({})
                .limit(limit)
                .skip(skip)
                .sort(sort);
            return res.status(200)
                .json({
                    status: 'success',
                    message: 'Data retrieved',
                    data: services
                });
        }
    }
    catch (error) {
        return res.status(500)
        .json({ status: 'Error', message: error.message,data:[] });
   
    }
}



const updateService = async (req, res) => {

    try {
        const id = req.query.id;
        if (!id) {
            return res.status(400)
                .json({ status: 'Error',message: 'Service id is required',data:[] });
        }
        const service_name = req.body.name;
        const isExists = await ServiceModel.find({ name: service_name });
        if (isExists.length > 0) {
            return res.status(400)
                .json({status: 'Error', message: 'Service already exist',data:[]});
        }

        const updatedService = await ServiceModel.updateOne({ _id: id }, { name: service_name });

        if (updatedService.modifiedCount===0) {
            return res.status(400)
                .json({ status: 'Error', message: 'Service not found' ,data:[]});
        }

        const service = await ServiceModel.find({ name: service_name }) ;

         
        return res.status(201)
        .json({
            status: 'success',
            message: 'Updated sucessfully',
            data:service
        });
    }
    catch (error) {
        return res.status(500)
        .json({ status: 'Error', message: error.message,data:[] });
    }


}



const deleteService = async (req, res) => {
    try {
        const id = req.query.id;
        if (!id) {
            return res.status(400)
                .json({ status: 'Error', message:'Service id is required' ,data:[]});
        }

        const deletedService = await ServiceModel.findByIdAndDelete(id);

        if (deletedService == null) {
            return res.status(400)
                .json({ status: 'Error', message:'Service not found',data:[] });
        }
        return res.status(201)
        .json({ status: 'success', message: 'Service type is deleted successfully',data:[] });

    }
    catch (error) {
        return res.status(500)
        .json({ status: 'Error', message: error.message,data:[] });
    }

}






const service = {
    createService,
    getService,
    updateService,
    deleteService
}

export default service;