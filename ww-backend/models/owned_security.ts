import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Account } from "./account";


@Entity()
export class OwnedSecurity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    symbol: string;

    @Column()
    quantity: number;

    @Column()
    boughtAt: number;

    @Column()
    boughtAtDate: Date;

    @ManyToOne(() => Account, (account: Account) => account.ownedSecurties)
    account: Account

}