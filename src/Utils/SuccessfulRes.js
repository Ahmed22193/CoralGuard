
const SUCCESS = (message = "Successful!", data = {}, statusCode = 200) => {
    return {
        success: true,
        message: message,
        data: data,
        statusCode: statusCode
    };
};

export { SUCCESS as SuccessfulRes };
export default SUCCESS;