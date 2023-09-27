import React from 'react';
import { View, StyleSheet } from 'react-native';
// import * as AppleAuthentication from 'expo-apple-authentication';


const AppleAuth: React.FC = ()  => {
    return (
        <View style={styles.container}>
            {/* <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE_OUTLINE}
                cornerRadius={5}
                style={styles.button}
                onPress={async () => {
                    try {
                        const credential = await AppleAuthentication.signInAsync({
                            requestedScopes: [
                                AppleAuthentication.AppleAuthenticationScope.EMAIL,
                            ],
                        });

                        console.log('apple auth credential  ', credential);
                        // signed in
                    } catch (e: any) {
                        if (e.code === 'ERR_REQUEST_CANCELED') {
                            // handle that the user canceled the sign-in flow
                        } else {
                            // handle other errors
                        }
                    }
                }}
            /> */}
        </View>
    );
}

export default AppleAuth;

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
