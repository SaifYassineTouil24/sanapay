import { Body, Controller, Post, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body) {
    return this.authService.register(body.email, body.password);
  }

  @Post('login')
  login(@Body() body) {
    return this.authService.login(body.email, body.password);
  }

  // 🔐 ROUTE PROTÉGÉE
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  me(@Req() req) {
    return req.user;
  }
}
