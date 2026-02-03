import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { Ewallet } from '../ewallet/ewallet.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Ewallet)
    private walletRepo: Repository<Ewallet>,
  ) {}

  async getProfile(userId: number) {
  const user = await this.userRepo.findOne({
    where: { id: userId },
    relations: ['wallet'], // ✅ correct
  });

  if (!user) {
    throw new NotFoundException('Utilisateur introuvable');
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,   // ✅ AJOUT
    lastName: user.lastName,     // ✅ AJOUT
    walletNumber: user.wallet?.walletNumber ?? null,
  };
}

}
