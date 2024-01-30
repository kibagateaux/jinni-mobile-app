import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import { entries } from 'lodash';

import SelectMulti from 'components/modals/SelectMultiModal';
import BaseWizardScreen from './BaseScreen';
// import { useGameContent } from 'contexts/GameContentContext';
import { track } from 'utils/logging';
import { TRACK_ONBOARDING_STAGE } from 'utils/config';
import { StatsConfig } from 'types/GameMechanics';

export interface OnboardingWizardProps {
    startIndex?: number;
    // screens: string[]; // expo routes
    onNext?: () => void;
    onBack?: () => void;
    onComplete: (config: object) => void;
    backButtonStyle?: object;
    nextButtonStyle?: object;
}

const avatarStats = StatsConfig.reduce((agg, s) => ({ ...agg, [s.name]: false }), {});
const avatarMoods = {
    protective: false,
    jubilant: false,
    lazy: false,
    pensive: false,
    loving: false,
    dominant: false,
    sassy: false,
    forlorn: false,
};
const intentions = {
    'creative expression': false,
    'community living': false,
    'unleashing inner child': false,
    'achieving immortality': false,
    'sexy physique': false,
};

const steps = [
    {
        dialogueData: {
            title: 'Welcome To Jinni',
            text: 'A self-actualization game that you play in real life. Take care of your tomogatchi (a.k.a jinni) and watch it evolved based on your actions and the data your feed it.',
        },
    },
    {
        dialogueData: {
            title: 'Customize Your Game',
            text: "Jinni is about making life fun. Everyone's life is different and they learn in different ways. Decide on your jinni's, your intentions for developing during the game, and how your jinni will evolve based onyour progress towards your intentions.",
        },
    },
    {
        dialogueData: {
            title: 'What kind of atitude do you want your jinni to have?',
            text: '',
        },
        options: avatarMoods,
    },
    {
        dialogueData: {
            title: 'What are you focused on improving in your life right now?',
            text: '',
        },
        options: avatarStats,
    },
    {
        dialogueData: {
            title: 'What do you want to get out of playing Jinni?',
            text: '',
        },
        options: intentions,
    },
    {
        dialogueData: {
            title: 'You Bonded With Your Jinni',
            text: 'Now your bestest of buddies and they will help you with maical spells throughout your day',
        },
    },
    {
        dialogueData: {
            title: 'Kiba ❤️s You 🫵',
            text: 'Jinni is still in beta. I dream and build everything you see and want to make it the best. \n\n Please join the beta tester telegram group and give any good or bad feedback you have 🙏 \n\n Much Love, Kiba Gateaux 💋',
        },
    },
];

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
    startIndex = 0,
    // screens,
    onNext,
    onBack,
    onComplete,
}) => {
    // const onboardingContent = useGameContent().onboarding.wizard;
    const [step, setStep] = useState(startIndex);
    const [playerSettings, setSettings] = useState({}); // :config for :AvatarViewer widget

    const changeStep = useCallback(
        (index: number) => {
            track(TRACK_ONBOARDING_STAGE, {
                currentStep: index,
                totalSteps: steps.length - 1,
                // screenName:
            });
            index < step ? onBack && onBack() : onNext && onNext();
            setStep(index);
        },
        [step, setStep, onBack, onNext],
    );

    const backStep = useCallback(() => {
        console.log('component:wizard:Onboarding:backStep', step, step - 1);
        if (step !== 0) {
            changeStep(step - 1);
        }
    }, [step, changeStep]);

    const nextStep = useCallback(() => {
        console.log('component:wizard:Onboarding:nextStep', step);
        if (step === steps.length - 1) {
            // onComplete should close out wizard
            onComplete(playerSettings);
            // open telegram for them to join group
            Linking.openURL('https://t.me/+fkqlrBc4YYczM2Mx');
        } else {
            changeStep(step + 1);
        }
    }, [step, changeStep, onComplete, playerSettings]);

    const onSettingSaved = useCallback(
        (options) => {
            console.log('on step saved', step, options);
            switch (step) {
                case 2:
                    if (!options) {
                        console.log(
                            'component:wizard:onboarding:onSave - NO options when expected -  ',
                            step,
                        );
                        break;
                    }

                    setSettings({
                        ...playerSettings,
                        mood: entries(options)
                            .filter(([, v]) => v)
                            .map(([k]) => k),
                    });
                    break;
                case 3:
                    if (!options) {
                        console.log(
                            'component:wizard:onboarding:onSave - NO options when expected -  ',
                            step,
                        );
                        break;
                    }

                    setSettings({
                        ...playerSettings,
                        stats: entries(options)
                            .filter(([, v]) => v)
                            .map(([k]) => k),
                    });
                    break;
                case 4:
                    if (!options) {
                        console.log(
                            'component:wizard:onboarding:onSave - NO options when expected -  ',
                            step,
                        );
                        break;
                    }

                    setSettings({
                        ...playerSettings,
                        intentions: entries(options)
                            .filter(([, v]) => v)
                            .map(([k]) => k),
                    });
                    break;
                default:
                    // no custom logic on non option
                    break;
            }
            // TODO onComplete should be called in BaseWizard and defined in here
            nextStep();
        },
        [playerSettings, step, nextStep],
    );

    const screenData = steps[step];
    console.log('component:wizard:Onboarding:render step', step, screenData);
    return screenData.options ? (
        <View style={styles.container}>
            <SelectMulti
                key={screenData.dialogueData.title}
                allowMultiple
                onClose={backStep}
                onFinalize={onSettingSaved}
                useModal={false}
                {...screenData}
            />
        </View>
    ) : (
        <BaseWizardScreen step={step} onBack={backStep} onNext={nextStep} {...screenData} />
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'skyblue',
        height: '100%',
        width: ' 100%',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    ctaContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    button: {
        padding: 10,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    closeButton: {
        padding: 10,
        borderRadius: 5,
        marginTop: 20,
    },
});

export default OnboardingWizard;
