
import { Equal } from "typeorm"
import { myPrismaClient } from "./config/datasource.js"
import { randomInt } from "crypto"
import { Prisma, ww_account } from "@prisma/client";


const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function createAShitTonOfSnapShots(username: string, snapshotCount: number){

    const user = await myPrismaClient.ww_user.findUnique({
        where: {
            username: username
        },
        include:{
            links: {
                include:{
                    accounts: true
                }
            }
        }
    })

    if(user == null)
        throw new Error("User Test not created")

    console.log("links: " + user.links)
    let accounts:ww_account[] = []

    for(const link of user.links){
        link.accounts.forEach((linkedAcc: ww_account) => {
            accounts.push(linkedAcc)
        })
    }

    accounts.forEach(async (account)=>{
        for(let i = 0; i < snapshotCount; i++){
            let date = new Date();
            date.setUTCDate(date.getDate() - i)
            const newSnapshot: Prisma.ww_account_snapshotCreateInput = {
                account:{
                    connect: {
                      id: account.id,
                    },
                  },
                balance: randomInt(1000000)/100,
                date:  date
            }
           await myPrismaClient.ww_account_snapshot.create({data: newSnapshot})
        }

    })

}

console.log("Starting Generation Of Fake Data")

console.log("Generating Fake Snapshots for Test User")

createAShitTonOfSnapShots("test", 50)

