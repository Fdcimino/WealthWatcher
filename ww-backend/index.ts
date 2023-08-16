require("dotenv").config()
const express = require('express')
const cors = require("cors")
const cookieParser = require("cookie-parser")

import "reflect-metadata"

const port = process.env.PORT || 3030

const routes = require('./routes/routes')

var app = express()

app.use(cookieParser())

app.use(cors({
    credentials: true,
    origin: true
}))

app.use(express.json())

app.use('/api', routes);

app.listen(port)

