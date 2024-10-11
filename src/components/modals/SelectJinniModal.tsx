import React from 'react';
import SelectModal from './SelectMultiModal';

type Options = { [id: string]: boolean }; // id = widget.id | resource.provider_id | human readable options
export interface SelectJinniWidgetProps {
    options: Options; // can have preselected options
    // onComplete: (event: unknown) => void; // active jinni preselected
    onClose: (data: unknown) => Promise<boolean>;
}
import { useActiveJinni } from 'hooks/useActiveJinni';
import { useGameContent } from 'contexts/GameContentContext';

const SelectJinniModal = ({ options, onClose, ...props }: SelectJinniWidgetProps) => {
    const { switchJinni } = useActiveJinni();
    const { setActiveModal } = useGameContent();

    return (
        <SelectModal
            backgroundColor="pink"
            {...props} // overwrite with our close
            useModal={true}
            onClose={onClose}
            onFinalize={(e) => {
                const selected = Object.entries(e).find(([, val]) => !!val);
                console.log('Switchi Jinni 🐉🌈', selected?.[0], selected);
                if (selected) switchJinni(selected[0]); // use jid of first selected jinni
                setActiveModal(undefined); // get rid of select modal after switching
            }}
            dialogueData={{
                title: 'Select jinni to watch',
                description: 'All jinni are always watching you 👁️ 👅 👁️',
            }}
            options={options}
            // allowMultiple={false}
        />
    );
};

export default SelectJinniModal;
