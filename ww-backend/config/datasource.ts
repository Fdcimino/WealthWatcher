require("dotenv").config()

import { DataSource } from "typeorm"
import {User} from "../models/user"
import { Account } from "../models/account"
import { AccountSnapshot } from "../models/account_snapshot"
import { Link } from "../models/link"
import { OwnedSecurity } from "../models/owned_security"
import { WWTransaction } from "../models/ww_transaction"

const DATABASE_HOST = process.env.DATABASE_HOST
const DATABASE_PORT = parseInt(process.env.DATABASE_PORT || "15432")
const DATABASE_NAME = process.env.DATABASE_NAME
const DATABASE_USERNAME = process.env.DATABASE_USERNAME
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD
const DATABASE_SYNCHRONIZE = JSON.parse(process.env.DATABASE_SYNCHRONIZE || "false")

const myAppDataSource = new DataSource({
    type: "postgres",
    host: DATABASE_HOST,
    port: DATABASE_PORT,
    username: DATABASE_USERNAME,
    password: DATABASE_PASSWORD,
    database: DATABASE_NAME,
    entities: [User, Account, AccountSnapshot, Link, OwnedSecurity, WWTransaction],
    synchronize: DATABASE_SYNCHRONIZE,
    logging: false,
})

myAppDataSource
    .initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err)
    })

export { myAppDataSource }
