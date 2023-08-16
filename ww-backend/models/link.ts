import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from "typeorm";
import { User } from "./user";
import { Account } from "./account";

@Entity()
export class Link {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    orgName: string;

    @Column()
    name: string;

    @Column()
    accessToken: string;

    @ManyToOne(() => User, (user: User) => user.links)
    user: User
    
    @Column({
        nullable: true,
    })
    transactionCursor: string

    @OneToMany(() => Account, (account: Account) => account.link, {
        cascade: true,
    }) 
    accounts: Account[]
}
