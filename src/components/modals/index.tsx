import React from 'react';

import BaseModal from './BaseModal';
import { default as ItemEquipWizardModal, ItemEquipWizardModalProps } from './ItemEquipWizardModal';
import { default as CreateSpellbookModal } from './CreateSpellbookModal';
import { default as GeneralTimeWarpModal } from './GeneralTimeWarpModal';
import { useGameContent } from 'contexts/GameContentContext';
import SelectJinniModal from './SelectJinniModal';
export { BaseModal, ItemEquipWizardModal, CreateSpellbookModal };

interface ModalRendererProps {
    onClose?: (data: unknown) => Promise<boolean | void>;
    [key: string]: unknown;
}

const ModalRenderer = (props: ModalRendererProps) => {
    const { activeModal, setActiveModal } = useGameContent();
    console.log('comp:modal:index:renderer', activeModal, props);

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
        case 'select-jinni':
            return <SelectJinniModal onClose={onClose} {...props} />;
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
