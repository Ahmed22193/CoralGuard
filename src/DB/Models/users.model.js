import mongoose , {Schema} from "mongoose";
import validator from 'validator';

export const userType = {
    patient:"PATIENT",
    doctor:"DOCTOR"
}
export const gender = {
    male:"MALE",
    female:"FEMALE"
}
export const roles = {
    admin:"ADMIN",
    user:"USER"
}


const UserModel = new Schema({
    firstName:{
        type:String,
        required:true
    },
    middleName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required: true,
        unique:true,
    },
    password:{
        type: String,
        required: true
    },
    userType:{
        type:String,
        enum:{
            values:Object.values(userType),
            message:`user type must be ${Object.values(userType).join(' or ')}`
        },
        default:userType.patient
    },
    gender:{
        type:String,
        enum:{
            values:Object.values(gender),
            message:`gender must be ${Object.values(gender).join(' or ')}`
        },
        required:true
    },
    role:{
        type:String,
        enum:{
            values:Object.values(roles),
            message:`user type must be ${Object.values(roles).join(' or ')}`
        },
        default:roles.user
    },
    government:{
        type:String
    },
    specialest: {
    type: String,
        required: function () {
            return this.userType === userType.doctor;
        }
    },
    address: {
    type: String,
        required: function () {
            return this.userType === userType.doctor;
        }
    },
    acceptTerms: {
        type: Boolean,
        default: function () {
            return this.userType === userType.doctor?false:true;
        }
    }
},{
    timestamps:true
});


export default mongoose.model("user", UserModel);
