import React, { useState } from 'react';
import { Text, } from 'react-native';

import { useGameContent } from 'contexts/GameContentContext';

import { Modal } from './';
import { InventoryItem } from 'types/GameMechanics';

type ItemEquipWizardModalProps = {
    item: InventoryItem;
    dialogueData: any; // params for modal text
    status: string;

}

const ItemEquipWizardModal = ({ item, dialogueData, status }: ItemEquipWizardModalProps) => {
    // const content = useGameContent().inventory[status];
    // const template = content.items[item.id]
    // const dialogue = typeof template === 'function' ? template(dialogueData) : template;

    // return (
    //     <Modal size="mid"  >
    //         <Text>{content.modal.title}</Text>
    //         <Text>{dialogue}</Text>
    //     </Modal>
    // )

    return null;
}

export default ItemEquipWizardModal;