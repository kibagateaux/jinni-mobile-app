// import { useTheme } from 'contexts/ThemeContext';
// import React, { useState, ReactNode } from 'react';
// import { Text, View, TouchableOpacity, StyleSheet, Button } from 'react-native';
// import BaseWizard from './';
// import { saveStorage } from 'utils/config';
// import { track } from 'utils/logging';
// import { useGameContent } from 'contexts/GameContentContext';

// const OnboardingWizard: React.FC<WizardProps> = ({
//     startIndex = 0,
//     screens,
//     onNext,
//     onBack,
//     onComplete,
//     backButtonStyle,
//     nextButtonStyle,
// }) => {
//     const onboardingContent = useGameContent().onboarding.wizard;

//     // const { height, width } = Dimensions.get('window');
//     // const modalStyle = {
//     //   ...styles.modal,
//     //   height: size === 'lg' ? height : size === 'md' ? height * 0.6 : 'auto',
//     //   width: size === 'lg' ? width : size === 'md' ? width * 0.8 : 'auto',
//     // };

//     //     const onOnboardingComplete = () =>{
//     //         saveStorage(ONBOARDING_STAGE, '1', false);
//     //     }

//     //    const  trackOnboarding = (index: number) => {
//     //         track(ONBOARDING_STAGE, {
//     //             index,
//     //             // screenName:
//     //         })
//     //    }
//     return null;
// };

// const styles = StyleSheet.create({
//     modalSize: {
//         top: '15%',
//         left: '10%',
//         right: '10%',
//         bottom: '15%',
//         // shadowColor: '#FFC1CB',
//         // shadowOffset: { width: 5, height: 10 },
//         // shadowOpacity: 1,
//         // shadowRadius: 10,
//     },
//     contentContainer: {
//         backgroundColor: 'white',
//         position: 'absolute',
//         flexDirection: 'column',
//         justifyContent: 'space-between',
//         padding: 25,
//         borderWidth: 2,
//         borderRadius: 10,
//     },
//     text: {
//         fontSize: 24,
//         fontWeight: 'bold',
//     },
//     ctaContainer: {
//         flex: 1,
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         marginTop: 20,
//     },
//     button: {
//         padding: 10,
//         borderRadius: 5,
//         marginHorizontal: 5,
//     },
//     closeButton: {
//         padding: 10,
//         borderRadius: 5,
//         marginTop: 20,
//     },
// });

// export default OnboardingWizard;
