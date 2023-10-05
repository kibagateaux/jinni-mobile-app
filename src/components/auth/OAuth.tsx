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

import { OAuthProvider } from 'types/GameMechanics';
import { oauthConfigs } from 'utils/oauth';

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
