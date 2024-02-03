import React from 'react';

import BaseModal from './BaseModal';
import { default as ItemEquipWizardModal, ItemEquipWizardModalProps } from './ItemEquipWizardModal';
import { default as CreateSpellbookModal } from './CreateSpellbookModal';
import { default as GeneralTimeWarpModal } from './GeneralTimeWarpModal';
import { useGameContent } from 'contexts/GameContentContext';
export { BaseModal, ItemEquipWizardModal, CreateSpellbookModal };

interface ModalRendererProps {
    onClose?: (data: unknown) => Promise<boolean | void>;
    [key: string]: unknown;
}

const ModalRenderer = (props: ModalRendererProps) => {
    const { activeModal, setActiveModal } = useGameContent();
    if (!activeModal || !activeModal.name) return null;
    const onClose = (data: unknown) => {
        props.onClose && props.onClose(data);
        setActiveModal(undefined);
    };

    switch (activeModal.name) {
        case 'equip-wizard':
            return (
                <ItemEquipWizardModal
                    onClose={onClose}
                    {...(activeModal as ItemEquipWizardModalProps)}
                    {...props}
                />
            );
        case 'create-spellbook':
            return <CreateSpellbookModal onClose={onClose} {...activeModal} {...props} />;
        default:
            return (
                <GeneralTimeWarpModal
                    onClose={onClose}
                    modalName={activeModal.name}
                    {...activeModal}
                    {...props}
                />
            );
    }
};

export default ModalRenderer;
