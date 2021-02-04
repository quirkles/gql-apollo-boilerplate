import { PrimaryGeneratedColumn, Column, Entity, BeforeInsert, BeforeUpdate, BaseEntity, OneToMany } from 'typeorm';
import { encrypt } from '../../encrypt';
import { Message } from './Message';

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    readonly id!: string;

    @Column({
        unique: true,
    })
    username!: string;

    @Column({
        select: false,
    })
    password!: string;

    @Column({
        length: 250,
        nullable: true,
    })
    bio!: string;

    @BeforeInsert()
    @BeforeUpdate()
    hashPassword(): void {
        if (this.password) {
            this.password = encrypt(this.password);
        }
    }

    @OneToMany(() => Message, (msg) => msg.sender)
    sentMessages!: Message[];

    @OneToMany(() => Message, (msg) => msg.recipient)
    receivedMessages!: Message[];
}
