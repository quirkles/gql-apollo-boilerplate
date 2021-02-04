import { PrimaryGeneratedColumn, Column, Entity, BaseEntity, ManyToOne } from 'typeorm';
import { User } from './User';

@Entity()
export class Message extends BaseEntity {
    @PrimaryGeneratedColumn()
    readonly id!: string;

    @Column({ length: 250 })
    text!: string;

    @ManyToOne(() => User, (user) => user.sentMessages)
    sender!: User;

    @ManyToOne(() => User, (user) => user.receivedMessages)
    recipient!: User;
}
