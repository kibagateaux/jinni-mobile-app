import { memoize } from 'lodash/fp'
import { Platform, Button, StyleSheet } from 'react-native';
import Constants from 'expo-constants';

import {
    // exchangeCodeAsync,
    makeRedirectUri,
    // TokenResponse,
    useAuthRequest,
} from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
const SCHEME = Constants.expoConfig?.scheme ?? 'jinni-health';
const useProxy = Constants.appOwnership === 'expo' && Platform.OS !== 'web';
import { OAuthProvider, OAuthProviders } from 'types/GameMechanics';


// allows the web browser to close correctly when using universal login on mobile
WebBrowser.maybeCompleteAuthSession();

export const oauthConfigs: { [key: string]: OAuthProvider } = {
    strava: {
        authorizationEndpoint: 'https://www.strava.com/oauth/mobile/authorize',
        tokenEndpoint: 'https://www.strava.com/oauth/token',
        revocationEndpoint: 'https://www.strava.com/oauth/deauthorize',
        scopes: ['activity:read_all'],
        clientId: process.env.EXPO_PUBLIC_STRAVA_CLIENT_ID || '',
    },
    spotify: {
        authorizationEndpoint: 'https://accounts.spotify.com/authorize',
        tokenEndpoint: 'https://accounts.spotify.com/api/token',
        clientId: process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID || '',
        scopes: [
            'user-follow-modify', // create social network on spotfiy
            'user-read-recently-played', // let others know what ur listening too
            'playlist-modify-public', // add suggested songs to playlists
            'playlist-read-collaborative',
        ],
    },
    coinbase: {
        authorizationEndpoint: 'https://www.coinbase.com/oauth/authorize',
        tokenEndpoint: 'https://api.coinbase.com/oauth/token',
        revocationEndpoint: 'https://api.coinbase.com/oauth/revoke',
        clientId: process.env.EXPO_PUBLIC_COINBASE_CLIENT_ID || '',
        scopes: ['wallet:user:read', 'wallet:accounts:read', 'wallet:transactions:read', ],
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
    console.log('Expo deep link scheme', SCHEME);

    if(Platform.OS !== 'web') {
        return makeRedirectUri({ native: Platform.select({
            android: `https://e877-95-14-82-25.ngrok.io/oauth/callback`,
            ios: `https://e877-95-14-82-25.ngrok.io/oauth/callback`,
            // android: `${SCHEME}://auth/oauth-callback`,
            // ios: `${SCHEME}://auth/oauth-callback`,
          }), });
    } else {
        WebBrowser.maybeCompleteAuthSession();
        return makeRedirectUri({ scheme: SCHEME });
    }
});