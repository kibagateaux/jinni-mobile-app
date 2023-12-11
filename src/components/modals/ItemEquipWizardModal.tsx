import React from 'react';
import { Text, ActivityIndicator, StyleSheet, View } from 'react-native';

import { useGameContent } from 'contexts/GameContentContext';

import BaseModal from './BaseModal';
import { InventoryItem, ItemStatus } from 'types/GameMechanics';

type ItemEquipWizardModalProps = {
    item: InventoryItem;
    dialogueData: object; // params for modal text
    status: ItemStatus;
};

const ItemEquipWizardModal = ({ item, dialogueData = {}, status }: ItemEquipWizardModalProps) => {
    // console.log('get equip item modal content', status, dialogueData, item);
    // console.log('game item content', useGameContent(), useGameContent().inventory);
    const content = useGameContent().inventory[item.id];
    // console.log('game item content', content);
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
        <BaseModal size="md">
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

export default ItemEquipWizardModal;
