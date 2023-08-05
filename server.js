import express from 'express'
import cors from 'cors'
import "dotenv/config"
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'


process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION ⚠️⚠️') 
    console.log(err.name, err.message)
    process.exit(1)
})

import corsOptions from './config/corsOption.js'
import credntials from './middlewares/credentials.js'
import AppError from './utils/AppError.js'
import connectDB from './config/dbConfig.js'
import globalErrorHandler from './controllers/errorController.js'
import authRoute from './routes/api/authRoute.js'

const app = express()
connectDB()

app.use(credntials)
app.use(cors(corsOptions))
app.use(cookieParser())
app.use(express.json())



app.use('/api/auth', authRoute)
app.all("*", (req, _res, next)=>{
    next(new AppError(`not found ${req.originalUrl} on this server`, 404))
})

app.use(globalErrorHandler)

const PORT = process.env.PORT || 3500

mongoose.connection.once('open', ()=>{
    console.clear()
    console.log('DB was SuucessFully Conneted 🥰🥰')
    const server = app.listen(PORT, () => {
        console.log(`server is running in port ${PORT}`)
    })

    process.on('unhandledRejection', ()=>{
        console.log('UNHANDLE REJECTION 🔥🔥 shutting down')
        server.close(()=>{
            process.exit(1)
        })
    })

})