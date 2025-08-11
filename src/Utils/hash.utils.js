import bcrypt from 'bcryptjs';

export const hash = async({plainText = "",saltRound = +process.env.SALT_ROUND})=>{
    return await bcrypt.hash(plainText,saltRound);
};


export const compair = async({plainText="",hash=""})=>{
    return await bcrypt.compare(plainText,hash);
};