require("dotenv").config()
import { Request, Response } from 'express';
import { CountryCode, ItemPublicTokenExchangeRequest, Products } from 'plaid';
import { User } from '../models/user';
import { myAppDataSource } from '../config/datasource';
import { Link } from '../models/link';
import {client} from '../config/plaidClient';
import { createAccountSnapshot, getAccounts, getAccountsCurrentBalance, getAuthenticatedUser, getAuthenticatedUserWithLinks, getAllTransactionsForUser, getTransactionSync } from '../service/service';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AccountSnapshot } from '../models/account_snapshot';

const router = require('express').Router()

const userRepository = myAppDataSource.getRepository(User)
const linkRepository = myAppDataSource.getRepository(Link)
const accountSnapshotRepository = myAppDataSource.getRepository(AccountSnapshot)

const JWT_SECRET = process.env.JWT_SECRET || "SECRET"

//Register a user 
router.post('/register', async (req: Request, res: Response) => {

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password, salt)

    const user = new User()
    user.username = req.body.username
    user.password = hashedPassword
    user.firstName = req.body.name
    user.lastName = req.body.name

    const result = await userRepository.save(user)

    const { password, ...data } = result

    res.send(data)
})

//Login a user
router.post('/login', async (req: Request, res: Response) => {
    const user = await userRepository.findOneBy({ username: req.body.username })

    if (!user) {
        return res.status(404).send({
            message: 'user not found'
        })
    }

    if (!await bcrypt.compare(req.body.password, user.password)) {
        return res.status(400).send({
            message: 'invalid credentials'
        })
    }
    const token = jwt.sign({ id: user.id }, JWT_SECRET)
    res.cookie('jwt', token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    })

    res.send({
        message: "Success"
    });
})

router.get('/user', async (req: Request, res: Response) => {
    try {
        const cookie = req.cookies['jwt']

        const claims = jwt.verify(cookie, JWT_SECRET)

        let user = await getAuthenticatedUser(claims)
        
        const { password, ...data } = user
        res.send(data)
    } catch (e) {
        return res.status(401).send({
            message: 'error'
        })
    }
})

router.post('/logout', async (req: Request, res: Response) => {
    res.cookie('jwt', '', {
        maxAge: 0
    })

    res.send({
        message: 'success'
    })
})

router.get('/ping', async (req: Request, res: Response) => {

    res.send(JSON.stringify("Alive"));
})

router.post('/create_link_token', async function (req: Request, res: Response) {
    //Get the client_user_id by searching for the current user
    const cookie = req.cookies['jwt']

    const claims = jwt.verify(cookie, JWT_SECRET)

    let user = await getAuthenticatedUser(claims)


    const clientUserId = user.id.toString();
    const request = {
        user: {
            // This should correspond to a unique id for the current user.
            client_user_id: clientUserId,
        },
        client_name: 'Plaid Test App',
        products: [Products.Auth, Products.Transactions],
        language: 'en',
        redirect_uri: 'http://localhost:3030/account',
        country_codes: [CountryCode.Us],
    };
    try {
        const createTokenResponse = await client.linkTokenCreate(request);
        console.log(createTokenResponse.data)
        res.json(createTokenResponse.data);
    } catch (error) {
        console.log(error)
    }
});

router.post('/setup_link', async function (req: Request, res: Response) {
    try {
        const claims = jwt.verify(req.cookies.jwt, JWT_SECRET);

        let user = await getAuthenticatedUser(claims)

        const request: ItemPublicTokenExchangeRequest = {
            public_token: req.body.public_token,
        };
        const createTokenResponse = await client.itemPublicTokenExchange(request);

        const link = new Link()
        link.user = user
        link.orgName = "test";
        link.accessToken = createTokenResponse.data.access_token
        link.name = createTokenResponse.data.item_id

        await linkRepository.save(link)
        

        const balanceRequest = {
            access_token: link.accessToken
        }

        const accountsBalanceGetResponse = await client.accountsBalanceGet(balanceRequest)
        createAccountSnapshot(accountsBalanceGetResponse.data.accounts, link)
        getTransactionSync(link)
        res.send(JSON.stringify("Success"));
    } catch (error) {
        if(error instanceof Error)
            console.log(error.message)
        else
            console.log(error)

        res.status(500).send({
            message: 'internal server error'
        });
    }
});

router.get('/accounts', async function (req: Request, res: Response) {
    try {
        const claims = jwt.verify(req.cookies.jwt, JWT_SECRET);

        let user = await getAuthenticatedUserWithLinks(claims)
        let accounts = await getAccounts(user)

        const cleanedAccounts = accounts.map((account) => {
            return{
                name: account.name,
                mask: account.mask,
                type: account.type,
                subType: account.subtype,
            }
        })

        console.log(accounts)
        res.send(cleanedAccounts)
    } catch (error) {
        if(error instanceof Error)
            console.log(error.message)
        else
            console.log(error)

        res.status(500).send({
            message: 'internal server error'
        });
    }
});

router.get('/accounts/balance', async function (req: Request, res: Response) {
    try {
        const claims = jwt.verify(req.cookies.jwt, JWT_SECRET);

        let user = await getAuthenticatedUserWithLinks(claims)

        let accounts = await getAccounts(user);

        let accountsWithBalance = await getAccountsCurrentBalance(accounts)

        console.log(accountsWithBalance)
        res.send(accountsWithBalance)
    } catch (error) {
        if(error instanceof Error)
            console.log(error.message)
        else
            console.log(error)

        res.status(500).send({
            message: 'internal server error'
        });
    }
});

router.get('/accounts/snaphots', async function (req: Request, res: Response) {
    try {
        const claims = jwt.verify(req.cookies.jwt, JWT_SECRET);

        let user = await getAuthenticatedUserWithLinks(claims)

        let accountsWithSnapshots = []

        let accounts = await getAccounts(user);

        let earliestDate = new Date()
        earliestDate.setDate(earliestDate.getDate() - 30)

        for(let account of accounts){
            let snapshots = await accountSnapshotRepository.findBy({account: account})
            snapshots.filter(snapshot => snapshot.date > earliestDate)
            let accountWithSnapshots= {
                account: account,
                snapshots: snapshots
            }
            
            accountsWithSnapshots.push(accountWithSnapshots)
        }

        res.send(accountsWithSnapshots)
        
    } catch (error) {
        if(error instanceof Error)
            console.log(error.message)
        else
            console.log(error)
        
        res.status(500).send({
            message: 'internal server error'
        });
    }
});

router.get('/transactions',async (req: Request, res: Response) => {
    try{
        const claims = jwt.verify(req.cookies.jwt, JWT_SECRET);

        let user = await getAuthenticatedUserWithLinks(claims)
        let transactions = await getAllTransactionsForUser(user)
        
        res.send(transactions)

    }catch(error){
        if(error instanceof Error)
            console.log(error.message)
        else
            console.log(error)
        
        res.status(500).send({
            message: 'internal server error'
        });
    }
})

router.post('/transactions/sync', async (req: Request, res: Response) => {
    try{
        const claims = jwt.verify(req.cookies.jwt, JWT_SECRET);

        let user = await getAuthenticatedUserWithLinks(claims)
        
        for(var link of user.links){
            getTransactionSync(link)
        }
        
        res.send("Sucess")

    }catch(error){
        if(error instanceof Error)
            console.log(error.message)
        else
            console.log(error)
        
        res.status(500).send({
            message: 'internal server error'
        });
    }
})

module.exports = router;
