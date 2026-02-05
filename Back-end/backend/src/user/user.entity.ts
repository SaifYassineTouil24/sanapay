import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { Ewallet } from '../ewallet/ewallet.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ name: 'firstName' })
  firstName: string;

  @Column({ name: 'lastName' })
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: true, name: 'isActive' })
  isActive: boolean;

  @Column({ default: false, name: 'isEmailVerified' })
  isEmailVerified: boolean;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;

  @OneToOne(() => Ewallet, (ewallet) => ewallet.user)
  ewallet: Ewallet;
}
