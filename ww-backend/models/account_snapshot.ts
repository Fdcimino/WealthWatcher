import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Account } from "./account";


@Entity()
export class AccountSnapshot {

    @PrimaryGeneratedColumn()
    id: number;

    @Column('decimal', { precision: 6, scale: 2 })
    balance: number;

    @Column()
    date: Date;

    @ManyToOne(() => Account,( account: Account) => account.snapshots )
    account: Account
}
