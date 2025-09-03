import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";

export const encrept = async(plainText)=>{
    return CryptoJS.AES.encrypt(plainText,process.env.ENCRYPT_KEY).toString();
}

export const decrypt = async(cipherText)=>{
    return CryptoJS.AES.decrypt(cipherText,process.env.ENCRYPT_KEY).toString(CryptoJS.enc.Utf8);
}

export const generateToken = (payload, expiresIn = '24h') => {
    return jwt.sign(payload, process.env.JWT_SECRET || process.env.TOKEN_SECRET, { 
        expiresIn 
    });
}

export const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET || process.env.TOKEN_SECRET);
} 