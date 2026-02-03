import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
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

  // ✅ NOM RÉEL
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @OneToOne(() => Ewallet, (wallet) => wallet.user)
  wallet: Ewallet;
}
