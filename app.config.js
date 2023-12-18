// eslint-ignore-next-line no-undef
const VARIANT = process.env.EXPO_PUBLIC_APP_VARIANT;
// console.log('GENERATING APP CONFIG FOR VARIANT:', VARIANT);
const isProd = VARIANT === 'production';
const packageName = isProd ? 'com.jinnihealth' : `com.jinnihealth.${VARIANT}`;
const appName = isProd ? 'Jinni Health' : `(${VARIANT}) Jinni Health`;

export default {
    expo: {
        name: appName,
        slug: 'jinni-health',
        version: '0.0.1',
        orientation: 'portrait',
        icon: './public/icon.png',
        userInterfaceStyle: 'light',
        splash: {
            image: './public/splash.png',
            resizeMode: 'fill',
            backgroundColor: '#FFC1CB',
        },
        assetBundlePatterns: ['**/*'],
        scheme: 'jinni-health',
        plugins: [
            'react-native-health',
            'react-native-health-connect',
            'react-native-nfc-manager',
            [
                'expo-build-properties',
                {
                    ios: {
                        deploymentTarget: '16.0',
                    },
                    android: {
                        compileSdkVersion: 34,
                        targetSdkVersion: 34,
                        minSdkVersion: 26,
                    },
                },
            ],
            [
                'expo-contacts',
                {
                    contactsPermission:
                        'Allow your jinni to access your friends list to contact their jinn and communicate with them in the spiritual world.',
                },
            ],
            [
                'expo-location',
                {
                    locationAlwaysAndWhenInUsePermission:
                        'Allow your jinni to follow you and protect you around the world.',
                    isAndroidBackgroundLocationEnabled: false,
                },
            ],
            'expo-router',
            'sentry-expo',
        ],
        hooks: {
            postPublish: [
                VARIANT === 'development'
                    ? {}
                    : {
                          file: 'sentry-expo/upload-sourcemaps',
                          config: {
                              organization: '${EXPO_PUBLIC_SENTRY_ORG}',
                              project: '${EXPO_PUBLIC_SENTRY_PROJECT}',
                          },
                      },
            ],
        },
        ios: {
            supportsTablet: false,
            infoPlist: {
                NSContactsUsageDescription:
                    'Allow your jinni to access your friends list to contact their jinn and communicate with them in the spiritual world.',
            },
            bundleIdentifier: packageName,
            config: {
                usesNonExemptEncryption: false,
            },
        },
        android: {
            adaptiveIcon: {
                foregroundImage: './public/adaptive-icon.png',
                backgroundColor: '#ffffff',
            },
            permissions: [
                'android.permission.NFC',
                'android.permission.READ_CONTACTS',
                'android.permission.WRITE_CONTACTS',
                'android.permission.health.READ_STEPS',
                // 'android.permission.health.READ_ACTIVE_CALORIES_BURNED',
                'android.permission.health.READ_TOTAL_CALORIES_BURNED',
                'android.permission.health.READ_BASAL_METABOLIC_RATE',
                'android.permission.health.READ_LEAN_BODY_MASS',
                'android.permission.health.READ_BODY_FAT',
                'android.permission.health.READ_EXERCISE',
                'android.permission.health.READ_DISTANCE',
                'android.permission.health.READ_HEART_RATE',
                'android.permission.health.READ_NUTRITION',
                'android.permission.health.READ_HYDRATION',
                'android.permission.health.READ_RESPIRATORY_RATE',
                'android.permission.health.READ_RESTING_HEART_RATE',
                // 'android.permission.health.READ_SLEEP',
                'android.permission.health.READ_WEIGHT',
                'android.permission.FOREGROUND_SERVICE',
            ],
            package: packageName,
        },
        experiments: {
            typedRoutes: true,
            tsconfigPaths: true,
        },
        extra: {
            router: {
                origin: false,
            },
            eas: {
                projectId: '9d90a8bf-a538-49f0-925c-afd83fd4c8d3',
            },
        },
        owner: 'malik2',
    },
};
