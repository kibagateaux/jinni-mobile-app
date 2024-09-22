import { Button } from '@rneui/themed';
import { entries } from 'lodash';
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
// basic fullsized screen
// back and next buttons
//

export interface BaseWizardScreenProps {
    dialogueData?: { [key: string]: string }; // key = title | text
    step: number;
    onNext: () => void;
    onBack: () => void;
    backButtonStyle?: object;
    nextButtonStyle?: object;
    children?: React.ReactElement;
}

const BaseWizardScreen = ({
    dialogueData,
    step,
    onNext,
    onBack,
    children,
}: BaseWizardScreenProps) => {
    return (
        <View style={styles.container}>
            {!dialogueData ? null : (
                <View style={styles.contentContainer}>
                    {entries(dialogueData).map(([type, content]) => (
                        <Text key={content} style={styles[type]}>
                            {content}
                        </Text>
                    ))}
                </View>
            )}
            {children}
            <View style={styles.buttonContainer}>
                <Button
                    title="Back"
                    color="purple"
                    onPress={onBack}
                    disabled={step > 0 ? false : true}
                />
                <Button title="Next" color="purple" onPress={onNext} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'skyblue',
        flex: 1,
        height: '100%',
        width: '100%',
        padding: '8%',
        flexDirection: 'column',
        justifyContent: 'space-around',
    },
    contentContainer: {
        flex: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 18,
    },
    text: {
        fontSize: 16,
        fontWeight: 'normal',
    },
    buttonContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});

export default BaseWizardScreen;
