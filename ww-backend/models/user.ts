import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Link } from "./link";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    username: string;

    @Column()
    password: string;

    @Column({nullable: true})
    firstName: string;
    
    @Column({nullable: true})
    lastName: string;

    @OneToMany(() => Link, (link) => link.user, {
        cascade: true,
    })
    links: Link[]
}