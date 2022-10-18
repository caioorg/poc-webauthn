import type { NextApiRequest, NextApiResponse } from "next";
import type { AuthenticationCredentialJSON } from '@simplewebauthn/typescript-types'
import { inMemoryUserDeviceDB, loggedInUserId } from '../../utils/inMemoryUserDeviceDB'
import { VerifiedAuthenticationResponse, verifyAuthenticationResponse, VerifyAuthenticationResponseOpts, verifyRegistrationResponse, VerifyRegistrationResponseOpts } from '@simplewebauthn/server';
import base64url from "base64url";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  if(method !== 'POST') return res.status(405).end()

  const body: AuthenticationCredentialJSON = req.body;

  // Consultar o usuário
  const user = inMemoryUserDeviceDB[loggedInUserId];
  const expectedChallenge = user.currentChallenge;

  let dbAuthenticator;
  const bodyCredIdBuffer = base64url.toBuffer(body.rawId)

  // "Consulte o banco de dados" aqui para um autenticador correspondente a `credentialID`
  for(const dev of user.devices) {
    if(dev.credentialID.equals(bodyCredIdBuffer)) {
      dbAuthenticator = dev;
      break;
    }
  }

  if(!dbAuthenticator) {
    // Atualize o contador do autenticador no banco de dados para a contagem mais recente na autenticação
    return res.status(404).send({ error: 'Authenticator is not registered with this site' })
  }

  let verification: VerifiedAuthenticationResponse;

  try {
    const opts: VerifyAuthenticationResponseOpts = {
      credential: body,
      expectedChallenge: `${expectedChallenge}`,
      expectedOrigin: '',
      expectedRPID: '',
      authenticator: dbAuthenticator,
      requireUserVerification: true,
    }

    verification = await verifyAuthenticationResponse(opts)
  } catch (error) {
    const _error = error as Error;
    console.error(_error);
    return res.status(400).send({ error: _error.message });
  }
  
  const { verified, authenticationInfo }  = verification

  if(verified) dbAuthenticator.counter = authenticationInfo.newCounter;

  res.send({ verified });
}