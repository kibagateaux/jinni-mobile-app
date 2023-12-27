// import { useState, useEffect } from 'react';
// import * as Linking from 'expo-linking';
// import Constants from 'expo-constants';
// import { router } from 'expo-router';
// import * as SplashScreen from 'expo-splash-screen';

// const prefix = Linking.createURL('/');
// const deepLinkScheme = Constants.expoConfig?.scheme ?? 'jinni-health';
// const universalLinkScheme = 'https://app.jinni.health/';

// // OK apparently deep linking *is* working but keep for now until fully tested in prod and know its unneeded
// export const useDeepLinks = () => {
//     // Prevent hiding the splash screen after the navigation has mounted.
//     SplashScreen.preventAutoHideAsync();

//     const [redirectUrl, setRedirectUri] = useState<string | undefined>();
//     const linkedInto = Linking.useURL();
//     useEffect(() => {
//         const { scheme, hostname, path } = linkedInto ? Linking.parse(linkedInto) : {};
//         const isRedirect = scheme === Constants.expoConfig?.scheme;

//         console.log('hook:deepLLink:past', redirectUrl);
//         console.log('hook:deepLLink:now', linkedInto, isRedirect);
//         // console.log('use deep link 2', scheme, isRedirect, hostname, '---', path );

//         if (linkedInto !== redirectUrl && isRedirect && path) {
//             const params = path
//                 ?.split('/')
//                 .reduce((obj, param) => ({ ...obj, [param]: param }), {});

//             router.replace({
//                 pathname: hostname,
//                 params,
//             });
//             setRedirectUri(Linking.createURL(hostname, params));
//         }
//         // always unmount splash screen after loading
//         SplashScreen.hideAsync();
//     }, [redirectUrl, linkedInto]);
// };

// // TODO should we make deepLinks use query params?
// // e.g. jinni-health://?path=inventory?id=Spotify&ability=spotify-share-profile
// const mapPathToParams = (page: string, path: string) => {
//     const params = path.split('/');
//     switch(page) {
//         case 'inventory':
//             return { id: path }
//         default:
//             return {}
//     }
// }
