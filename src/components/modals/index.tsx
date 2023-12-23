import React from 'react';

import BaseModal from './BaseModal';
import { default as ItemEquipWizardModal, ItemEquipWizardModalProps } from './ItemEquipWizardModal';
import { default as CreateSpellbookModal } from './CreateSpellbookModal';
import { default as GeneralTimeWarpModal } from './GeneralTimeWarpModal';
export { BaseModal, ItemEquipWizardModal, CreateSpellbookModal };

interface ModalRendererProps {
    modalName: string;
    dialogueData: object;
    [key: string]: unknown;
}

const ModalRenderer = ({ modalName, ...props }: ModalRendererProps) => {
    switch (modalName) {
        case 'equip-wizard':
            return <ItemEquipWizardModal {...(props as ItemEquipWizardModalProps)} />;
        case 'create-spellbook':
            return <CreateSpellbookModal {...props} />;
        default:
            return <GeneralTimeWarpModal modalName={modalName} {...props} />;
    }
};

export default ModalRenderer;
