import * as dbService from '../DB/dbService.js';
import UserModel from '../DB/Models/users.model.js';

const isAdmin = async(req,res,next)=>{
    const {_id} = req.user;
    const admin = await dbService.findById({
        model:UserModel,
        id:_id
    });
    if(!admin) return next(new Error("Admin Not Found",{cause:404}));
    if(admin.role !== "ADMIN"){
        return next(new Error("UnAuthorized",{cause:401}));
    }
    next();
}

export default isAdmin;