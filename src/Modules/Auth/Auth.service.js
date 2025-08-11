import UserModel, { userType } from '../../DB/Models/users.model.js';
import * as dbService from '../../DB/dbService.js';
import SUCCESS from '../../Utils/SuccessfulRes.js';
import { compair, hash } from '../../Utils/hash.utils.js';
import jwt from 'jsonwebtoken';

export const signUp = async(req , res , next)=>{
    const {
        firstName,
        middleName,
        lastName,
        phone,
        password,
        userType,
        gender,
        government,
        specialest,
        address
    } = req.body; 
    const user = await dbService.findOne({
        model:UserModel,
        filter:{phone}
    });
    if(user) return next(new Error("User is already exist!",{cause:404}));
    const hashedPassword = await hash({plainText:password});
    const newUser = await dbService.create({
        model:UserModel,
        data:{
            firstName:firstName,
            middleName:middleName,
            lastName:lastName,
            phone:phone,
            password:hashedPassword,
            userType:userType,
            gender:gender,
            government:government,
            specialest:specialest,
            address:address
        }
    });
    SUCCESS(res , 201 , "User Created Successfully.",newUser);
}

export const login = async(req , res , next)=>{
    const {phone , password} = req.body;
    const user = await dbService.findOne({
        model:UserModel,
        filter:{phone}
    });
    if(!user)return next(new Error("User Not Found or wrong phone or password",{cause:404}));
    const hashedPassword = await compair({plainText:password,hash:user.password});
    if(!hashedPassword) return next(new Error("User Not Found or wrong phone or password",{cause:401}));
    const token = jwt.sign(
        {
            _id:user._id,
            userType:user.userType
        },
        process.env.TOKEN_SECRET,
        {expiresIn:"1d"}
    );
    SUCCESS(res , 200 , "User loged Successfully.",token);
}
