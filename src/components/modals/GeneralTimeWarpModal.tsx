import React from 'react';
import { Text, ActivityIndicator, StyleSheet, View } from 'react-native';

import { useGameContent } from 'contexts/GameContentContext';

import BaseModal from './BaseModal';

export interface GeneralTimeWarpModalProps {
    modalName: string;
    dialogueData?: object; // params for modal text
}

const GeneralTimeWarpModal = ({
    modalName,
    dialogueData = {},
    ...props
}: GeneralTimeWarpModalProps) => {
    const content = useGameContent().modals[modalName];
    if (!content) return null;

    const titleTemplate = content.title;
    const dialogueTemplate = content.text;
    const title = typeof titleTemplate === 'function' ? titleTemplate(dialogueData) : titleTemplate;
    const dialogue =
        typeof dialogueTemplate === 'function' ? dialogueTemplate(dialogueData) : dialogueTemplate;

    return (
        <BaseModal size="md" {...props}>
            <View>
                <Text style={styles.text}>{title}</Text>
                <Text style={styles.text}>{dialogue}</Text>
                <ActivityIndicator size="large" />
            </View>
        </BaseModal>
    );
};
const styles = StyleSheet.create({
    text: {
        fontSize: 24,
        fontWeight: '500',
    },
});

export default GeneralTimeWarpModal;
