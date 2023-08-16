import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, Index } from "typeorm";
import { Link } from "./link";
import { AccountSnapshot } from "./account_snapshot";
import { OwnedSecurity } from "./owned_security";
import { WWTransaction } from "./ww_transaction";

@Entity()
export class Account {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column()
    accountId: string;

    @Column()
    mask: string;

    @Column({nullable: true})
    name: string;

    @Column()
    type: string;

    @Column()
    subtype: string;

    @ManyToOne(() => Link, (link: Link) => link.accounts)
    link: Link

    @OneToMany(() => AccountSnapshot, (snapshot: AccountSnapshot) => snapshot.account, {
        cascade: true,
    })
    snapshots: AccountSnapshot[]

    @OneToMany(() => OwnedSecurity, (ownedSecurity: OwnedSecurity) => ownedSecurity.account, {
        cascade: true,
    })
    ownedSecurties: OwnedSecurity[]

    @OneToMany(() => WWTransaction, (transaction: WWTransaction) => transaction.account, {
        cascade: true,
    })
    transactions: WWTransaction[]

}
