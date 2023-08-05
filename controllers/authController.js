import AppError from "../utils/AppError.js" 
import UserModel from '../models/UserModel.js'
import catchFn from "../utils/catchFn.js" 
import randomInteger from "random-int"
import jwt from 'jsonwebtoken'
import MelipayamakApi from 'melipayamak' 


const handelSmsCode = catchFn(async(req, res, next)=>{
    const {phoneNumber} =  req.body 
    if(!phoneNumber) return next(new AppError("َشماره همراه نمیتواند خالی باشد", 400))
    console.log('phone: ',typeof phoneNumber)
    const regex = new RegExp("^09\\d{9}$")
    const isVAlidNum = regex.test(phoneNumber)
    if(!isVAlidNum) return next(new AppError("شماره همراه معتبر نیست", 400)) 

    const verificationCode = randomInteger(100123, 999878) 
    let user = await UserModel.findOne({phoneNumber}) 
    if(!user){
        user = await UserModel.create({phoneNumber})
    }
    user.verificationCode = verificationCode
    user.verificationDate = new Date() 
    await user.save()
    const username = process.env.MELIPAYAMAK_USERNAME
    const password =process.env.MELIPAYAMAK_PWD
    const api = new MelipayamakApi(username,password)
    const sms = api.sms() 
    const to = phoneNumber.toString() 
    const text = verificationCode
   

    sms.sendByBaseNumber(text, to,process.env.MELIPAYAMAK_USERID)
    .then((response)=>{
        console.log(response)
        if(response.Value.length > 2) {
            res.json({
                message:"کد تایید به شماره موبایل وارد شده ارسال گردید",
                phoneNumber
                
            })
        }
    })
    .catch((error)=>{
        console.log(error)
        return next(new AppError("کد تایید ارسال تشد دوباره تلاش کنید", 400))
    })
   
})


const handelSmsAuth = catchFn(async(req, res, next)=>{
    const {phoneNumber, verificationCode} = req.body 
    if(!phoneNumber || !verificationCode) return next(new AppError("َشماره همراه یا کدتایید الزامی است", 400))

    const regex = new RegExp("^09\\d{9}$")
    const isValidNum = regex.test(phoneNumber) 
    if(!isValidNum)return next(new AppError("شماره همراه معتبر نیست", 400)) 

    const user = await UserModel.findOne({phoneNumber})
    if(!user) return next(new AppError("کاربری یافت نشد", 400))

    if(Number(verificationCode) <= 100123) return next(new AppError("َشماره وارد شده اشتباه میباشد"),400)

    if(user.verificationCode !== Number(verificationCode)) return next(new AppError("کد تایید اشتباه میباشد",400))
    if(!user.verificationDate) return next(new AppError("کد ارسالی معتبر نیست",400))
    const verificationDate = new Date(
        user.verificationDate.getTime() + 120 * 1000
    )
    if(verificationDate < new Date()){
        user.verificationCode = "" 
        user.verificationDate = null
        await user.save() 
        return next(new AppError("کد ارسال شده منقضی شده است",400))
    } 
    
    const cookies = req.cookies 

    const newRefreshToken = jwt.sign(
        {phoneNumber}, 
        process.env.REFRESH_TOKEN, 
        {expiresIn:'30m'}
    )

    const accessToken = jwt.sign(
        {phoneNumber}, 
        process.env.ACCESS_TOKEN, 
        {expiresIn:'5m'}
    )

    let newRefreshTokenArray = !cookies?.jwt 
        ? user.refreshToken 
        : user.refreshToken.filter(rt => rt !== cookies.jwt) 
    
    if(cookies?.jwt) {
        const refreshToken = cookies.jwt 
        const userFound = await UserModel.findOne({refreshToken})
        if(!userFound){
            newRefreshTokenArray = []
        }
        res.clearCookie("jwt", {httpOnly:true, sameSite:"None", secure:true})
    }
    user.refreshToken = [...newRefreshTokenArray, newRefreshToken ]
    user.verificationCode = "" 
    user.verificationDate = null
    await user.save()  

    res.cookie("jwt", newRefreshToken, {
        httpOnly: true,
        sameSite:"None", 
        secure:true,
        maxAge: 1000 * 60 * 60 * 24 * 5 

    })

    res.json({
        accessToken, 
        userInfo:{phoneNumber}
    })
})

export default {handelSmsAuth, handelSmsCode}