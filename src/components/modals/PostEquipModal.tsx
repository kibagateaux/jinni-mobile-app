import React, { useState } from 'react';
import { Text, } from 'react-native';

import { useGameContent } from 'contexts/GameContentContext';

import Modal from './Modal';

type PostEquipModalProps = {
    item: InventoryItem;
    dialogueData: any; // params for modal text
}

const PostEquipModal = ({ item, dialogueData }) => {
    const content = useGameContent().inventory['post-equip'][item.id];
    return (
        <Modal>
            <Text>{content.modal.title}</Text>
            <Text>{content.items[item.id](dialogueData)}</Text>
        </Modal>
    )
}

export default PostEquipModal;