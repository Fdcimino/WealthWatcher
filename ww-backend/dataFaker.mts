
/* import { Equal } from "typeorm"
import { myAppDataSource } from "./config/datasource.js"
import { Account } from "./models/account.js"
import { AccountSnapshot } from "./models/account_snapshot.js"
import { Link } from "./models/link.js"
import { User } from "./models/user.js"
import { randomInt } from "crypto"


const accountRepository = myAppDataSource.getRepository(Account)
const accountSnapshotRepository = myAppDataSource.getRepository(AccountSnapshot)
const userRepository = myAppDataSource.getRepository(User)
const linkRepository = myAppDataSource.getRepository(Link)

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function createAShitTonOfSnapShots(username: string, snapshotCount: number){

    const user = await userRepository.findOneBy({username: username})

    if(user == null)
        throw new Error("User Test not created")

    const links = await linkRepository.findBy({user: Equal(user.id)})
    console.log("links: " + links)
    let accounts:Account[] = []

    for(const link of links){
        const linkAccounts = await accountRepository.findBy({link: Equal(link.id)})
        linkAccounts.forEach((linkedAcc: Account) => {
            accounts.push(linkedAcc)
        })
        console.log("linked Accounts: " + linkAccounts)
    }

    accounts.forEach(async (account)=>{
        for(let i = 0; i < snapshotCount; i++){
            let snapshot = new AccountSnapshot()
            snapshot.account = account;
            snapshot.balance = randomInt(1000000)/100
            let date = new Date();
            date.setUTCDate(date.getDate() - i)
            snapshot.date = date;

            await accountSnapshotRepository.save(snapshot)
        }

    })

}

console.log("Starting Generation Of Fake Data")

console.log("Generating Fake Snapshots for Test User")

while(!myAppDataSource.isInitialized){
    await sleep(50)
} 
createAShitTonOfSnapShots("test2", 50)

*/