import React from 'react';
import { Text, ActivityIndicator, StyleSheet, View } from 'react-native';

import { useGameContent } from 'contexts/GameContentContext';

import BaseModal from './BaseModal';
import { InventoryItem, ItemStatus } from 'types/GameMechanics';

export interface ItemEquipWizardModalProps {
    item: InventoryItem;
    dialogueData: object; // params for modal text
    status: ItemStatus;
}

const IconForStatus = (status: ItemStatus) => {
    switch (status) {
        case 'equipped':
            return <Text style={styles.text}>🫡 </Text>;
        case 'equipping':
        default:
            return <ActivityIndicator size="large" />;
    }
};

const ItemEquipWizardModal = ({
    item,
    dialogueData = {},
    status,
    ...props
}: ItemEquipWizardModalProps) => {
    // console.log('get equip item modal content', status, dialogueData, item);
    // console.log('game item content', useGameContent(), useGameContent().inventory);
    const content = useGameContent().inventory[item.id];
    console.log('game item content', content);
    if (!content) return null;
    if (!content[status]) return null;
    // console.log('game item content', content[status]);

    const titleTemplate = content[status].modal.title;
    const dialogueTemplate = content[status].modal.text;
    const title = typeof titleTemplate === 'function' ? titleTemplate(dialogueData) : titleTemplate;
    const dialogue =
        typeof dialogueTemplate === 'function' ? dialogueTemplate(dialogueData) : dialogueTemplate;

    // return null;
    return (
        <BaseModal size="md" {...props}>
            <View>
                <Text style={styles.text}>{title}</Text>
                <Text style={styles.text}>{dialogue}</Text>
                {IconForStatus(status)}
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

export default ItemEquipWizardModal;
