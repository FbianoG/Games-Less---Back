import express from 'express'
import router from './routes/router'
import cors from 'cors'
import dotenv from 'dotenv'
import { corsOptions } from './assets/cors'
dotenv.config()

const app = express()
const port = process.env.PORT

app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(router)


app.listen(port, () => {
    console.log(`Server is running: http://localhost:` + port)
})