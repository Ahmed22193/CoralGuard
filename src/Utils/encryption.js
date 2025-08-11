import CryptoJS from "crypto-js"


export const encrept = async(plainText)=>{
    return CryptoJS.AES.encrypt(plainText,process.env.ENCRYPT_KEY).toString();
}

export const decrypt = async(cipherText)=>{
    return CryptoJS.AES.decrypt(cipherText,process.env.ENCRYPT_KEY).toString(CryptoJS.enc.Utf8);
} 