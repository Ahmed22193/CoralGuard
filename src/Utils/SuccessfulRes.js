
const SUCCESS = (res,status=200,message="Successfull!",data={})=>{
    return res.status(status).json({
        message:message,
        data:data
    })
}
export default SUCCESS;