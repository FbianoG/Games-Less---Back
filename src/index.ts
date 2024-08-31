import express from 'express'
import router from './routes/router'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
dotenv.config()

const app = express()
const port = process.env.PORT

app.use(cors())
app.use(cookieParser())
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(router)


app.listen(port, () => {
    console.log(`Server is running: http://localhost:` + port)
})