import type { NextApiRequest, NextApiResponse } from 'next'
import { generateRegistrationOptions } from '@simplewebauthn/server'
import type { GenerateRegistrationOptionsOpts } from '@simplewebauthn/server'
import { inMemoryUserDeviceDB, loggedInUserId } from '../../utils/inMemoryUserDeviceDB'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  if(method !== 'GET') return res.status(405).end()

  const user = inMemoryUserDeviceDB[loggedInUserId];
  const { username, devices } = user

  const configRegister: GenerateRegistrationOptionsOpts = {
    rpName: 'POC - WebAuthn Example',
    rpID: 'localhost',
    userID: loggedInUserId,
    userName: username,
    timeout: 60000,
    attestationType: 'none',
    excludeCredentials: devices.map(dev => ({
      id: dev.credentialID,
      type: 'public-key',
      transports: dev.transports
    })),
    authenticatorSelection: {
      userVerification: 'required',
      residentKey: 'required',
    },
    supportedAlgorithmIDs: [-7, -257],
  }

  const options = generateRegistrationOptions(configRegister)

  inMemoryUserDeviceDB[loggedInUserId].currentChallenge = options.challenge;

  return res.status(200).send(options)
}