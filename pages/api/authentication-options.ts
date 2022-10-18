import type { NextApiRequest, NextApiResponse } from 'next'
import type { GenerateAuthenticationOptionsOpts } from '@simplewebauthn/server'
import { generateAuthenticationOptions } from '@simplewebauthn/server'
import { inMemoryUserDeviceDB, loggedInUserId } from '../../utils/inMemoryUserDeviceDB'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  if(method !== 'GET') return res.status(405).end()

  const user = inMemoryUserDeviceDB[loggedInUserId];

  const configAuthentication: GenerateAuthenticationOptionsOpts = {
    timeout: 60000,
    allowCredentials: user.devices.map(dev => ({
      id: dev.credentialID,
      type: 'public-key',
      transports: dev.transports,
    })),
    userVerification: 'required',
    rpID: 'localhost'
  }

  const options = generateAuthenticationOptions(configAuthentication)

  inMemoryUserDeviceDB[loggedInUserId].currentChallenge = options.challenge;

  return res.status(200).send(options)
}