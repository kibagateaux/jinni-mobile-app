import { memoize } from 'lodash';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

import {
    // exchangeCodeAsync,
    makeRedirectUri,
    // TokenResponse,
} from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
const SCHEME = Constants.expoConfig?.scheme ?? 'jinni-health';
// const useProxy = Constants.appOwnership === 'expo' && Platform.OS !== 'web';
import { OAuthProvider } from 'types/GameMechanics';
import { ID_PROVIDER_TEMPLATE_SLOT, getAppConfig, saveStorage } from './config';
import { cleanGql, qu } from './api';

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
    console.log('util:oauth:DeepLinkScheme', SCHEME);

    if (Platform.OS !== 'web') {
        return makeRedirectUri({
            native: Platform.select({
                // android: `https://3e4b-45-164-150-39.ngrok-free.app/oauth/callback`,
                // ios: `https://3e4b-45-164-150-39.ngrok-free.app/oauth/callback`,
                android: `${getAppConfig().API_URL}/oauth/callback`,
                ios: `${getAppConfig().API_URL}/oauth/callback`,
            }),
        });
    }
    return null;
});

export const QU_PROVIDER_ID = cleanGql(`
    query(
        $verification: SignedRequest!,
        $provider: String!,
        $playerId: String!
    ) {
        provider_id(
            verification: $verification, 
            provider: $provider,
            player_id: $playerId
        ) {
            provider_id
        }
    }
`);

// frequent helper functions + extra caching
/**
 * @description fetches the players id on integrations platform to use in abilities and widgets
 * @dev custom resolver func so cache based on values not object identity
 * @param playerId
 * @param provider
 * @returns id on provider or null
 */
export const getProviderId = memoize(async ({ playerId, provider }): Promise<string | null> => {
    const response = await qu<string | null>({ query: QU_PROVIDER_ID })({ playerId, provider });
    const id = response?.data ? response.data.provider_id : null;
    console.log('util:oauth:getProviderId', response, id);
    id && (await saveStorage(ID_PROVIDER_TEMPLATE_SLOT + provider, id, false));
    return id;
}, JSON.stringify);
