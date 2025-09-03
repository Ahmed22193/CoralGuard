import bcrypt from 'bcryptjs';

export const hash = async({plainText = "",saltRound = +process.env.SALT_ROUND})=>{
    return await bcrypt.hash(plainText,saltRound);
};

export const compair = async({plainText="",hash=""})=>{
    return await bcrypt.compare(plainText,hash);
};

// Admin service compatible functions
export const hashPassword = async(password, saltRounds = +process.env.SALT_ROUND) => {
    return await bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async(password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};