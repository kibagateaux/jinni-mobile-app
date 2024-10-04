import { memoize } from 'lodash';
import { Platform } from 'react-native';

import * as WebBrowser from 'expo-web-browser';
// const useProxy = Constants.appOwnership === 'expo' && Platform.OS !== 'web';
import { OAuthProvider, OAuthProviderIds } from 'types/GameMechanics';
import {
    ID_OAUTH_NONCE_SLOT,
    ID_PLAYER_SLOT,
    ID_PROVIDER_IDS_SLOT,
    getAppConfig,
    getStorage,
    saveStorage,
} from './config';
import { quProviderId } from './api';
import { getSpellBook } from './zkpid';
import { obj } from 'types/UserConfig';
import { randomUUID } from 'expo-crypto';

// allows the web browser to close correctly when using universal login on mobile
WebBrowser.maybeCompleteAuthSession();

export const oauthConfigs: { [key: string]: OAuthProvider } = {
    // TODO ensure keys conforms to OAuthProviders
    Strava: {
        authorizationEndpoint: 'https://www.strava.com/oauth/mobile/authorize',
        tokenEndpoint: 'https://www.strava.com/oauth/token',
        revocationEndpoint: 'https://www.strava.com/oauth/deauthorize',
        scopes: ['activity:read_all'],
        clientId: process.env.EXPO_PUBLIC_STRAVA_CLIENT_ID || '',
    },
    Github: {
        authorizationEndpoint: 'https://github.com/login/oauth/authorize',
        tokenEndpoint: 'https://github.com/login/oauth/access_token',
        scopes: [
            //https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps
            'read:user', // get profile info
            'user:follow', // follow other jinni playeres to create social network on github
            'repo', // read commits, code content, etc. to update jinni appearance
        ],
        clientId: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID || '',
    },
    Spotify: {
        authorizationEndpoint: 'https://accounts.spotify.com/authorize',
        tokenEndpoint: 'https://accounts.spotify.com/api/token',
        clientId: process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID || '',
        scopes: [
            'user-follow-modify', // follow other jinni playeres to create social network on spotfiy
            'user-read-recently-played', // let others know what ur listening too
            'playlist-modify-public', // add suggested songs to playlists
            'playlist-modify-private', // to create collaborative playlists
            'playlist-read-collaborative', // to read all playlists
            'user-top-read', // to see most listened to songs/artists
        ],
    },
    Coinbase: {
        authorizationEndpoint: 'https://www.coinbase.com/oauth/authorize',
        tokenEndpoint: 'https://api.coinbase.com/oauth/token',
        revocationEndpoint: 'https://api.coinbase.com/oauth/revoke',
        clientId: process.env.EXPO_PUBLIC_COINBASE_CLIENT_ID || '',
        scopes: ['wallet:user:read', 'wallet:accounts:read', 'wallet:transactions:read'],
    },
    undefined: {
        authorizationEndpoint: '',
        tokenEndpoint: '',
        revocationEndpoint: '',
        scopes: [''],
        clientId: '',
    },
};

export const createOauthRedirectURI = memoize(() => {
    const callbackSuffix = '/oauth/callback';
    return getAppConfig().REDIRECT_URL + callbackSuffix;
});

/**
 * @desc
 * @param provider - oauth provider that request is being sent to
 * @returns state param for server + app to verify user + session is a valid oauth request
 */
export const generateRedirectState = async (provider: OAuthProviderIds): Promise<string> => {
    const nonce = randomUUID();
    const player = await getStorage(ID_PLAYER_SLOT);
    if (!player) return Promise.resolve(`.${provider}.${nonce}`); // TODO shoul this return null since we check for sig on backend?

    const sig = await (await getSpellBook()).signMessage(`${player}.${provider}.${nonce}`);
    console.log('gen oauth state', nonce, sig);
    const state = `${player}.${Platform.OS}.${nonce}.${sig}`;
    saveStorage(ID_OAUTH_NONCE_SLOT, { [provider]: state }, true).then((store) => {
        console.log('util:oauth:genState:nonce-saved', provider, store);
    });
    return state;
};

// frequent helper functions + extra caching
/**
 * @description fetches the players id on integrations platform to use in abilities and widgets
 * @dev saves provider id
 * @param playerId - player we want to get id for
 * @param provider - provider that issues id
 * @returns id on provider or null
 */
export const getProviderId = async ({ playerId, provider }: obj): Promise<string | null> => {
    const cached = (await getStorage<obj>(ID_PROVIDER_IDS_SLOT))?.[provider];
    console.log('util:oauth:getProviderId:cached', cached);
    if (cached && cached === playerId) return cached;
    try {
        const response = await quProviderId({ player_id: playerId, provider });
        // console.log('util:oauth:getProviderId:res', response.data);
        const id = response?.data ? response.data.sync_provider_id : null;
        console.log('util:oauth:getProviderId', response, id);

        if (id && playerId === (await getStorage<string>(ID_PLAYER_SLOT))) {
            console.log(
                'util:oauth:getProviderId:synced players provider id. saving locally',
                provider,
                playerId,
                id,
            );
            await saveStorage(ID_PROVIDER_IDS_SLOT, { [provider]: id }, true);
        }
        // asssume local save always succeeds
        return id;
    } catch (e) {
        console.log('util:oauth:getProviderId:ERROR', e);
        return null;
    }
};
