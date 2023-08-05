import AppError from "../utils/AppError.js"; 

const handleIntityParseFaild = () => {
    const message = "فرمت JSON معتبر نیست"
    return new AppError(message, 400)
}

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status:err.status, 
        message:err.message, 
        error: err, 
        stack:err.statck
    })
}

const sendErrorPro = (err, res) => {
    if(err.isOperational) {
        res.status(err.statusCode).json({
            status:err.status,
            message:err.message 
        })
    }else{ 
        res.status(500).json({
            status:"error", 
            message:"خطایی در سرور رخ داد"
        })
    }
}

const globalErrorHandler = (err, _req, res, _next)=>{
    err.statusCode = err.statusCode || 500 
    err.status = err.status || "error" 

    if(process.env.NODE_ENV?.trim() === 'development'){
        return sendErrorDev(err, res)
    }
    else if(process.env.NODE_ENV?.trim() === 'production'){
        const error = {...err, message:err.message}
        console.log('\n error for production \n', err) 
        if(err.type == 'entity.parse.faild') return error = handleIntityParseFaild() 
        return sendErrorPro(error, res)
    }
}

export default globalErrorHandler