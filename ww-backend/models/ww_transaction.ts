import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Account } from "./account";

@Entity()
export class WWTransaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    accountId: string

    @Column()
    transactionId: string

    @Column("decimal", { precision: 5, scale: 2 })
    amount: number;

    @Column({
        nullable: true,
    })
    currencyCode: string

    @Column()
    detailedCategory: string

    @Column()
    primaryCategory: string

    @Column({
        nullable: true,
    })
    name: string;
    
    @Column({
        nullable: true,
    })
    merchantName: string;
    
    @Column()
    paymentChannel: string;

    @Column()
    datetime: Date

    @ManyToOne(() => Account, (account: Account) => account.transactions)
    account: Account
}
