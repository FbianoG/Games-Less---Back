import pg from 'pg'

import dotenv from 'dotenv'
dotenv.config()

const { Pool } = pg

const pool = new Pool({
    user: process.env.USER_PG,
    password: process.env.PASSWORD_PG,
    host: process.env.HOST_PG,
    database: process.env.DATA_BASE_PG,
    port: Number(process.env.PORT_PG),
})

export default pool
