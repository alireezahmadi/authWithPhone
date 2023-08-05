import rateLimit from 'express-rate-limit' 

const phoneLimiter = rateLimit({
    windowMs: 1000 * 60 * 3,
    max: 4, 
    message:"بیش از حد تلاش کردید بعد از 3 دقیقه تلاش کنید",
    standarHeaders:true,
    legacyHeaders:false
})

const codeLimiter = rateLimit({
    windowMs: 1000 * 60 * 2 ,
    max:3, 
    message:"بیش از حد تلاش کردید بعد از 2 دقیقه تلاش کنید",
    standardHeaders:true, 
    legacyHeaders:false
})

export {phoneLimiter, codeLimiter}