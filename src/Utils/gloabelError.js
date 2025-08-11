export const gloabelError = (err,req,res,next)=>{
    const status = err.cause || 500
    return res.status(status).json({
    message:"something wen wrong",
    err:err.message,
    stack:err.stack
    })
}