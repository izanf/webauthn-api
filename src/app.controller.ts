import { Controller, Get, Req, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { WebauthnService } from './webauthn/webauthn.service';

@Controller()
export class AppController {
  constructor(private authService: AuthService, private webauthnService: WebauthnService) {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Req() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('authn/register')
  async authnRegister(@Req() req: Request) {
    return this.webauthnService.register(req);
  }

  @UseGuards(JwtAuthGuard)
  @Get('authn/registration-options')
  async authnRegistrationOptions(@Req() req: Request) {
    return this.webauthnService.authnRegistrationOptions(req);
  }

  @Post('authn/authenticate')
  async authnAuthenticate(@Req() req: Request) {
    return this.webauthnService.authenticate(req);
  }

  @Get('authn/authenticate-options')
  async authnAuthenticateOptions(@Req() req: Request) {
    return this.webauthnService.authnAuthenticateOptions(req);
  }
}