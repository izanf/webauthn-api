import { Injectable } from '@nestjs/common';
import { ExpectedAttestationResult, Fido2Lib } from 'fido2-lib';
import base64url from 'base64url';
import * as crypto from 'crypto';

const fido = new Fido2Lib({
  timeout: 60000,
  rpId: 'localhost',
  rpName: 'Yes Technology',
  rpIcon: 'https://whatpwacando.today/src/img/icons/icon-512x512.png',
  challengeSize: 128,
  attestation: 'none',
  cryptoParams: [-7, -257],
  authenticatorAttachment: 'platform',
  authenticatorRequireResidentKey: false,
  authenticatorUserVerification: 'required'
});

const origin = 'http://localhost:4519';

@Injectable()
export class WebauthnService {
  constructor() {}

  async register(req) {
    const { credential } = req.body;
    
    const challenge: any = new Uint8Array(req.session.challenge.data).buffer;
    credential.rawId = new Uint8Array(Buffer.from(credential.rawId, 'base64')).buffer;
    credential.response.attestationObject = base64url.decode(credential.response.attestationObject, 'base64');
    credential.response.clientDataJSON = base64url.decode(credential.response.clientDataJSON, 'base64');
    
    const attestationExpectations: ExpectedAttestationResult = {
      challenge,
      origin,
      factor: 'either'
    };
    
    try {
      const regResult = await fido.attestationResult(credential, attestationExpectations);
  
      req.session.publicKey = regResult.authnrData.get('credentialPublicKeyPem');
      req.session.prevCounter = regResult.authnrData.get('counter');

      console.log('sssss', regResult);
  
      return { status: 'ok' };
    }

    catch(error) {
      console.log('error', error);
      return { error };
    }
  }

  async authnRegistrationOptions(req) {
    try {
      const registrationOptions: any = await fido.attestationOptions();

      req.session.challenge = Buffer.from(registrationOptions.challenge);
      req.session.userHandle = crypto.randomBytes(32);
      
      registrationOptions.user.id = req.session.userHandle;
      registrationOptions.challenge = Buffer.from(registrationOptions.challenge);
      
      // iOS
      registrationOptions.authenticatorSelection = { authenticatorAttachment: 'platform' };

      return registrationOptions;
    } catch (error) {
      console.log('error', error);
      return { error };
    }
  }

  async authenticate (req) {
    const { credential } = req.body;
    credential.rawId = new Uint8Array(Buffer.from(credential.rawId, 'base64')).buffer;

    const challenge = new Uint8Array(req.session.challenge.data).buffer;
    const { publicKey, prevCounter } = req.session;
    console.log('userHandle', credential.response.userHandle, Buffer.from(req.session.userHandle).toString('base64'))

    if (publicKey === 'undefined' || prevCounter === undefined) {
      return { status: 'not found' };
    } else {
      const assertionExpectations: any = {
        challenge,
        origin,
        factor: 'either',
        publicKey,
        prevCounter,
        userHandle: new Uint8Array(Buffer.from(req.session.userHandle, 'base64')).buffer
      };

      try {
        await fido.assertionResult(credential, assertionExpectations);

        return { status: 'ok' };
      } catch(e) {
        console.log('error', e);
        return { status: 'failed' };
      }
    }
  }

  async authnAuthenticateOptions(req) {
    const authnOptions = await fido.assertionOptions();

    req.session.challenge = Buffer.from(authnOptions.challenge);

    authnOptions.challenge = Buffer.from(authnOptions.challenge);

    return authnOptions;
  }
}