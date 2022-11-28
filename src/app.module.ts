import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WebauthnModule } from './webauthn/webauthn.module';
import { WebauthnService } from './webauthn/webauthn.service';

@Module({
  imports: [AuthModule, UsersModule, WebauthnModule],
  controllers: [AppController],
  providers: [AppService, WebauthnService],
})
export class AppModule {}
