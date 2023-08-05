import mongoose from "mongoose"; 

const connectDB = async() => {
    try{
        await mongoose.connect(process.env.MONGO_URI,{
            useNewUrlParser: true
        })
    }
    catch(error){
        console.log(' Fail to connected DB😔😔', error)
    }
}

export default connectDB