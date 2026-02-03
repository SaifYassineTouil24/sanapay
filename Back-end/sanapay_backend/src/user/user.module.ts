import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { Ewallet } from '../ewallet/ewallet.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Ewallet])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
