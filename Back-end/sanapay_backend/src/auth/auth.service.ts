import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../user/user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string) {
    const exists = await this.userRepo.findOne({ where: { email } });
    if (exists) {
      throw new BadRequestException('Utilisateur déjà existant');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepo.create({
      email,
      password: hashedPassword,
    });

    await this.userRepo.save(user);

    return {
      success: true,
      message: 'Utilisateur enregistré avec succès',
    };
  }

  async login(email: string, password: string) {
  const user = await this.userRepo.findOne({ where: { email } });

  if (!user) {
    throw new BadRequestException('Identifiants invalides');
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new BadRequestException('Identifiants invalides');
  }

  const payload = {
    sub: user.id,        // 🔥 ID RÉEL
    email: user.email,
  };

  const token = this.jwtService.sign(payload);

  return {
    success: true,
    access_token: token,
  };
}

}
