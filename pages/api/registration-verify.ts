import type { NextApiRequest, NextApiResponse } from 'next'
import type { VerifiedRegistrationResponse, VerifyRegistrationResponseOpts } from '@simplewebauthn/server'
import type { AuthenticatorDevice, RegistrationCredentialJSON } from '@simplewebauthn/typescript-types';
import { verifyRegistrationResponse  } from '@simplewebauthn/server'
import { inMemoryUserDeviceDB, loggedInUserId } from '../../utils/inMemoryUserDeviceDB'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const body: RegistrationCredentialJSON = req.body;
  
  const user = inMemoryUserDeviceDB[loggedInUserId]
  
  const expectedChallenge = user.currentChallenge;

  let verification: VerifiedRegistrationResponse

  try {
    const opts: VerifyRegistrationResponseOpts = {
      credential: body,
      expectedChallenge: `${expectedChallenge}`,
      expectedOrigin: 'http://localhost:3000',
      expectedRPID: 'localhost',
      requireUserVerification: true 
    }

    verification = await verifyRegistrationResponse(opts)
  } catch (error) {
    const _error = error as Error;
    console.error(_error);
    return res.status(400).send({ error: _error.message });
  }

  const { verified, registrationInfo } = verification;

  if (verified && registrationInfo) {
    const { credentialPublicKey, credentialID, counter } = registrationInfo;

    const existingDevice = user.devices.find(device => device.credentialID.equals(credentialID));

    if (!existingDevice) {
      // Adicione o dispositivo retornado à lista de dispositivos do usuário
      const newDevice: AuthenticatorDevice = {
        credentialPublicKey,
        credentialID,
        counter,
        transports: body.transports,
      };
      user.devices.push(newDevice);
    }
  }

  res.send({ verified });
}