import { PrimaryGeneratedColumn, Column, Entity, BaseEntity, BeforeInsert, BeforeUpdate } from 'typeorm';
import { encrypt } from '../../encrypt';

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

    @BeforeInsert()
    @BeforeUpdate()
    hashPassword(): void {
        if (this.password) {
            this.password = encrypt(this.password);
        }
    }
}
