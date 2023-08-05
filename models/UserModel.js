import mongoose from "mongoose"; 

const userSchema = new mongoose.Schema({
    phoneNumber:{type:Number, require:true, uinque:true},
    verificationCode: {type:Number},
    verificationDate: {type:Date}, 
    refreshToken: [String]
},{timestamps:true})

export default mongoose.model('User', userSchema)