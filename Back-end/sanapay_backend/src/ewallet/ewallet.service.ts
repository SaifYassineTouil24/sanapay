import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ewallet } from './ewallet.entity';
import { User } from '../user/user.entity';

@Injectable()
export class EwalletService {
  constructor(
    @InjectRepository(Ewallet)
    private readonly walletRepository: Repository<Ewallet>,
  ) {}

  async createWallet(user: User): Promise<Ewallet> {
    const wallet = this.walletRepository.create({
      walletNumber: `SP-${Date.now()}`,
      user,
    });
    return this.walletRepository.save(wallet);
  }
}
