import { Module } from '@nestjs/common';
import { WebauthnService } from './webauthn.service';

@Module({
  providers: [WebauthnService]
})
export class WebauthnModule {}
