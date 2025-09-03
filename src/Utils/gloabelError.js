export const gloabelError = (err,req,res,next)=>{
    const status = err.cause || 500
    return res.status(status).json({
    message:"something wen wrong",
    err:err.message,
    stack:err.stack
    })
}

// Create error function for throwing errors
export const globalError = (message, statusCode = 500) => {
    const error = new Error(message);
    error.cause = statusCode;
    return error;
};