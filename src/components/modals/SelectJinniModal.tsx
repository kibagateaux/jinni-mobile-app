import React from 'react';
import SelectModal from './SelectMultiModal';

type Options = { [id: string]: boolean }; // id = widget.id | resource.provider_id | human readable options
export interface SelectJinniWidgetProps {
    options: Options; // can have preselected options
    onComplete: (event: unknown) => void; // active jinni preselected
    onClose: (data: unknown) => Promise<boolean>;
}

const SelectJinniModal = ({ options, onClose, onComplete, ...props }: SelectJinniWidgetProps) => {
    return (
        <SelectModal
            backgroundColor="pink"
            {...props} // overwrite with our close
            useModal={true}
            onClose={onClose}
            onFinalize={onComplete}
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
