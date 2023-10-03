import React, { useState } from 'react';
import { Text, } from 'react-native';

import { useGameContent } from 'contexts/GameContentContext';

import BaseModal from './BaseModal';
import { InventoryItem, ItemStatus } from 'types/GameMechanics';

type ItemEquipWizardModalProps = {
    item: InventoryItem;
    dialogueData: any; // params for modal text
    status: ItemStatus;

}

const ItemEquipWizardModal = ({ item, dialogueData = {}, status }: ItemEquipWizardModalProps) => {
    console.log('get equip item modal content', status, dialogueData, item);
    const content = useGameContent().inventory[item.id];
    if(!content || !content[status]) return null;

    const titleTemplate = content[status].modal.title
    const dialogueTemplate = content[status].modal.text
    const title = typeof titleTemplate === 'function' ? titleTemplate(dialogueData) : titleTemplate;
    const dialogue = typeof dialogueTemplate === 'function' ? dialogueTemplate(dialogueData) : dialogueTemplate;

    // return null;
    return (
        <BaseModal size="mid" >
            <Text>{title}</Text>
            <Text>{dialogue}</Text>
        </BaseModal>
    );
}

export default ItemEquipWizardModal;