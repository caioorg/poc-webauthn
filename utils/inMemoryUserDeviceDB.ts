import type { AuthenticatorDevice } from '@simplewebauthn/typescript-types';

interface LoggedInUser {
  id: string;
  username: string;
  devices: AuthenticatorDevice[];
  currentChallenge?: string;
}

export const loggedInUserId = 'internalUserId';

export const inMemoryUserDeviceDB: { [loggedInUserId: string]: LoggedInUser } = {
  [loggedInUserId]: {
    id: loggedInUserId,
    username: `user@localhost`,
    devices: [],
    /**
     * A simple way of storing a user's current challenge being signed by registration or authentication.
     * It should be expired after `timeout` milliseconds (optional argument for `generate` methods,
     * defaults to 60000ms)
     */
    currentChallenge: undefined,
  },
};