import { randomUUID } from 'expo-crypto';
import {
    createOauthRedirectURI,
    generateRedirectState,
    getProviderId,
    oauthConfigs,
} from '../oauth';
import {
    getAppConfig,
    getStorage,
    ID_OAUTH_NONCE_SLOT,
    ID_PROVIDER_IDS_SLOT,
    saveStorage,
} from '../config';
import { getSpellBook } from '../zkpid';
import { quProviderId } from '../api';

jest.mock('../config', () => ({
    ...jest.requireActual('../config'),
    getAppConfig: jest.fn(() => ({
        REDIRECT_URL: 'http://localhost:8888',
    })),
    getStorage: jest.fn(),
    saveStorage: jest.fn(async (s) => s),
}));

jest.mock('expo-web-browser', () => ({
    maybeCompleteAuthSession: jest.fn(),
}));

jest.mock('expo-crypto', () => ({
    randomUUID: jest.fn(),
}));

jest.mock('../zkpid', () => ({
    getSpellBook: jest.fn(),
}));

jest.mock('../api', () => ({
    quProviderId: jest.fn(),
}));

describe('OAuth Utils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createOauthRedirectURI', () => {
        it('should create correct redirect URI', () => {
            const defaultHost = 'http://localhost:8888';
            const callbackPath = '/oauth/callback';
            const result = createOauthRedirectURI();
            expect(result).toStrictEqual(`${defaultHost}${callbackPath}`);
        });

        it('should memoize the result', () => {
            // Clear memoized value from past runs so we start fresh calls on this test
            createOauthRedirectURI.cache.clear();

            expect(getAppConfig).toHaveBeenCalledTimes(0);

            const result = createOauthRedirectURI();
            expect(getAppConfig).toHaveBeenCalledTimes(1);

            const result2 = createOauthRedirectURI();
            expect(getAppConfig).toHaveBeenCalledTimes(1);
            expect(result2).toStrictEqual(result);
        });
    });

    describe('generateRedirectState', () => {
        it('should generate state with correct format and variables: player ID, platform, nonce, and signature', async () => {
            getStorage.mockResolvedValue('player123');
            randomUUID.mockReturnValue('nonce456');
            const mockSignMessage = jest.fn().mockResolvedValue('signature789');
            getSpellBook.mockResolvedValue({ signMessage: mockSignMessage });

            const result = await generateRedirectState('Github');

            expect(result).toStrictEqual('player123.ios.nonce456.signature789');
            expect(result).toMatch(/^player123\.(ios|android|web)\.nonce456\.signature789$/);
            expect(saveStorage).toHaveBeenCalledWith(ID_OAUTH_NONCE_SLOT, { Github: result }, true);
        });

        it('should return fallback state when player ID is not available', async () => {
            getStorage.mockResolvedValue(null);
            randomUUID.mockReturnValue('nonce456');

            const result = await generateRedirectState('Github');

            expect(result).toStrictEqual('.Github.nonce456');
        });

        it('should save generated state to local storage', async () => {
            getStorage.mockResolvedValue('player123');
            randomUUID.mockReturnValue('nonce456');
            const mockSignMessage = jest.fn().mockResolvedValue('signature789');
            getSpellBook.mockResolvedValue({ signMessage: mockSignMessage });

            const result = await generateRedirectState('Github');

            expect(saveStorage).toHaveBeenCalledWith(ID_OAUTH_NONCE_SLOT, { Github: result }, true);
        });

        it('should support multiple providers with different redirect states', async () => {
            getStorage.mockResolvedValue('player123');
            randomUUID.mockReturnValueOnce('nonce456').mockReturnValueOnce('nonce789');
            const mockSignMessage = jest
                .fn()
                .mockResolvedValueOnce('signature111')
                .mockResolvedValueOnce('signature222');
            getSpellBook.mockResolvedValue({ signMessage: mockSignMessage });

            const githubState = await generateRedirectState('Github');
            const stravaState = await generateRedirectState('Strava');

            expect(saveStorage).toHaveBeenCalledTimes(2);
            expect(saveStorage).toHaveBeenNthCalledWith(
                1,
                ID_OAUTH_NONCE_SLOT,
                { Github: githubState },
                true,
            );
            expect(saveStorage).toHaveBeenNthCalledWith(
                2,
                ID_OAUTH_NONCE_SLOT,
                { Strava: stravaState },
                true,
            );
            expect(githubState).not.toStrictEqual(stravaState);
        });

        it('format for signature in state nonce is `playerId.provider.nonce`', async () => {
            const mockPlayer = 'player123';
            const mockProvider = 'Github';
            const mockNonce = 'nonce456';
            const mockSignature = 'correctSignature789';

            getStorage.mockResolvedValue(mockPlayer);
            randomUUID.mockReturnValue(mockNonce);

            const mockSignMessage = jest.fn().mockResolvedValue(mockSignature);
            getSpellBook.mockResolvedValue({ signMessage: mockSignMessage });

            await generateRedirectState(mockProvider);
            expect(mockSignMessage).toHaveBeenCalledWith(
                `${mockPlayer}.${mockProvider}.${mockNonce}`,
            );
        });
    });

    describe('getProviderId', () => {
        const mockPlayerId = 'player123';
        const mockProvider = 'Github';

        it('should return cached provider ID if available', async () => {
            getStorage.mockResolvedValue({ [mockProvider]: mockPlayerId });
            // await getProviderId({ playerId: mockPlayerId, provider: mockProvider });
            const result = await getProviderId({ playerId: mockPlayerId, provider: mockProvider });
            expect(result).toEqual(mockPlayerId);
            expect(quProviderId).not.toHaveBeenCalled();
            expect(saveStorage).not.toHaveBeenCalled();
            expect(getStorage).toHaveBeenCalledTimes(1);
        });

        it('must fetch if cached is for different player than provider request', async () => {
            getStorage.mockResolvedValue({ [mockProvider]: 'cachedId' });
            getStorage.mockResolvedValueOnce(null).mockResolvedValueOnce(mockPlayerId);
            quProviderId.mockResolvedValueOnce({ data: { sync_provider_id: 'newProviderId' } });

            // await getProviderId({ playerId: mockPlayerId, provider: mockProvider });
            const result = await getProviderId({ playerId: mockPlayerId, provider: mockProvider });
            expect(result).toStrictEqual('newProviderId');

            expect(quProviderId).toHaveBeenCalledWith({
                player_id: mockPlayerId,
                provider: mockProvider,
            });
            expect(saveStorage).toHaveBeenCalledWith(
                ID_PROVIDER_IDS_SLOT,
                { [mockProvider]: 'newProviderId' },
                true,
            );
        });

        it('should fetch and save provider ID if not cached', async () => {
            getStorage.mockResolvedValueOnce(null).mockResolvedValueOnce(mockPlayerId);
            quProviderId.mockResolvedValueOnce({ data: { sync_provider_id: 'newProviderId' } });

            const result = await getProviderId({ playerId: mockPlayerId, provider: mockProvider });
            console.log('get provider id res in test', result, mockPlayerId);

            expect(result).toStrictEqual('newProviderId');
            expect(quProviderId).toHaveBeenCalledWith({
                player_id: mockPlayerId,
                provider: mockProvider,
            });
            expect(saveStorage).toHaveBeenCalledWith(
                ID_PROVIDER_IDS_SLOT,
                { [mockProvider]: 'newProviderId' },
                true,
            );
        });

        it('should return null if API call fails', async () => {
            getStorage.mockResolvedValue(null);
            quProviderId.mockRejectedValue(new Error('API Error'));

            const result = await getProviderId({ playerId: mockPlayerId, provider: mockProvider });

            expect(result).toBeNull();
        });

        it('should not save provider ID if player ID mismatch', async () => {
            getStorage.mockResolvedValueOnce(null).mockResolvedValueOnce('differentPlayerId');
            quProviderId.mockResolvedValue({ data: { sync_provider_id: 'newProviderId' } });

            await getProviderId({ playerId: mockPlayerId, provider: mockProvider });

            expect(saveStorage).not.toHaveBeenCalled();
        });
    });

    describe('oauthConfigs', () => {
        it('should have correct configuration for Strava', () => {
            expect(oauthConfigs.Strava).toEqual({
                authorizationEndpoint: 'https://www.strava.com/oauth/mobile/authorize',
                tokenEndpoint: 'https://www.strava.com/oauth/token',
                revocationEndpoint: 'https://www.strava.com/oauth/deauthorize',
                scopes: ['activity:read_all'],
                clientId: expect.any(String),
            });
        });

        it('should have correct configuration for Github', () => {
            expect(oauthConfigs.Github).toEqual({
                authorizationEndpoint: 'https://github.com/login/oauth/authorize',
                tokenEndpoint: 'https://github.com/login/oauth/access_token',
                scopes: ['read:user', 'user:follow', 'repo'],
                clientId: expect.any(String),
            });
        });

        it('should have correct configuration for Spotify', () => {
            expect(oauthConfigs.Spotify).toEqual({
                authorizationEndpoint: 'https://accounts.spotify.com/authorize',
                tokenEndpoint: 'https://accounts.spotify.com/api/token',
                clientId: expect.any(String),
                scopes: [
                    'user-follow-modify',
                    'user-read-recently-played',
                    'playlist-modify-public',
                    'playlist-modify-private',
                    'playlist-read-collaborative',
                    'user-top-read',
                ],
            });
        });

        it('should have correct configuration for Coinbase', () => {
            expect(oauthConfigs.Coinbase).toEqual({
                authorizationEndpoint: 'https://www.coinbase.com/oauth/authorize',
                tokenEndpoint: 'https://api.coinbase.com/oauth/token',
                revocationEndpoint: 'https://api.coinbase.com/oauth/revoke',
                clientId: expect.any(String),
                scopes: ['wallet:user:read', 'wallet:accounts:read', 'wallet:transactions:read'],
            });
        });

        it('should have a fallback undefined configuration', () => {
            expect(oauthConfigs.undefined).toEqual({
                authorizationEndpoint: '',
                tokenEndpoint: '',
                revocationEndpoint: '',
                scopes: [''],
                clientId: '',
            });
        });
    });
});
