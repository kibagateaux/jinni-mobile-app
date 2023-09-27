import { useEffect, useState } from 'react';
import { Platform, Button, StyleSheet } from 'react-native';
import {
    // exchangeCodeAsync,
    makeRedirectUri,
    // TokenResponse,
    useAuthRequest,
} from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

import { Link } from 'components';


interface OAuthProvider {
    authorizationEndpoint: string;
    tokenEndpoint: string;
    revocationEndpoint?: string;
    clientId: string;
    scopes: string[];
}

const oauthConfigs: { [key: string]: OAuthProvider } = {
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
};

interface OAuthProps {
    provider: string;
}

const OAuth = ({ provider }: OAuthProps) => {
    
    const [redirectUri, setRedirectUri] = useState('jinni-health://oauth-redirect');
    const discovery = oauthConfigs[provider];
    // console.log('oauth provider', provider, discovery);

    
    useEffect(() => {
        if(Platform.OS !== 'web') {
            setRedirectUri(makeRedirectUri({ native: 'jinni-health' }));
        } else {
            WebBrowser.maybeCompleteAuthSession();
            makeRedirectUri({ scheme: 'jinni-health' });
        }
    }, [Platform.OS, redirectUri]);
    
    // console.log('oauth redirect', redirectUri);
    
    
    
    const [request, response, promptAsync] = useAuthRequest(
        {
            clientId: discovery.clientId,
            scopes: discovery.scopes,
            redirectUri,
        },
        discovery,
    );
        
    if (!discovery || !redirectUri) return null; // invalid OAuth provider
    // console.log('oauth request', request, response, promptAsync);
    return (
        <Button
            disabled={!request}
            title={provider}
            onPress={() => {
                promptAsync();
              }}
        />
    );
};

export default OAuth;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        width: 200,
        height: 64,
        fontSize: 12,
        alignItems: 'center',
        fontWeight: 'bold',
        color: 'purple',
    },
});
