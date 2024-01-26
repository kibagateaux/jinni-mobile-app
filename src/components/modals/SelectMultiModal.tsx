import React, { useState } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { isEmpty } from 'lodash';
import { CheckBox, Icon } from '@rneui/themed';

import { useGameContent } from 'contexts/GameContentContext';

import BaseModal from './BaseModal';
import { Button } from '@rneui/themed';
import { useAuth } from 'contexts/AuthContext';

type Options = { [id: string]: boolean }; // id = widget.id | resource.provider_id
export interface SelectWidgetSettingsModalProps {
    dialogueData?: object; // params for modal text
    allowMultiple?: boolean; // if can check off multiple boxes
    options: Options; // can have preselected options
    onFinalize: (options: Options) => void;
}

const SelectModal = ({
    dialogueData = {},
    options,
    allowMultiple,
    // provider,
    // widgetId,
    onFinalize,
}: SelectWidgetSettingsModalProps) => {
    const content = useGameContent().modals['select-multi'];
    console.log(
        'modal:select multi ',
        useGameContent().modals['select-multi'],
        Object.keys(useGameContent().modals),
    );

    const { player } = useAuth();
    const [checks, setChecks] = useState<Options>(options);

    const setCheck = (key: string, val: boolean) => {
        if (allowMultiple || isEmpty(checks)) setChecks({ ...checks, [key]: val });
    };

    console.log('Select options', checks);

    const titleTemplate = content.title;
    const dialogueTemplate = content.text;
    const title = typeof titleTemplate === 'function' ? titleTemplate(dialogueData) : titleTemplate;
    const dialogue =
        typeof dialogueTemplate === 'function' ? dialogueTemplate(dialogueData) : dialogueTemplate;

    if (!player?.id)
        return (
            <BaseModal size="md">
                <View>
                    <Text style={styles.text}>You must have a jinni to customize their home</Text>
                </View>
            </BaseModal>
        );

    return (
        <BaseModal size="md">
            <View>
                <Text style={styles.text}>{title}</Text>
                <Text style={styles.text}>{dialogue}</Text>
                {Object.keys(options).map((id) => {
                    return (
                        <CheckBox
                            key={id}
                            center
                            title={id}
                            checkedIcon="dot-circle-o"
                            uncheckedIcon="circle-o"
                            checked={checks[id]}
                            onPress={() => setCheck(id, !checks[id])}
                        />
                    );
                })}
                <Button onPress={() => onFinalize(checks)}>
                    {' '}
                    Save <Icon name="asl" color="white" type="foundation" />{' '}
                </Button>
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

export default SelectModal;
