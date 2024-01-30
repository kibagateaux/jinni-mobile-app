import React, { useState } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { capitalize, isEmpty } from 'lodash';
import { CheckBox, Icon } from '@rneui/themed';

import { useGameContent } from 'contexts/GameContentContext';

import BaseModal from './BaseModal';
import { Button } from '@rneui/themed';
import { useAuth } from 'contexts/AuthContext';

type Options = { [id: string]: boolean }; // id = widget.id | resource.provider_id | human readable options
export interface SelectWidgetSettingsModalProps {
    dialogueData?: object; // params for modal text
    allowMultiple?: boolean; // if can check off multiple boxes
    options: Options; // can have preselected options
    onFinalize: (options: Options) => void;
    onClose?: () => void;
    useModal?: boolean;
}

const SelectModal = ({
    dialogueData = {},
    options,
    allowMultiple,
    onClose,
    onFinalize,
    useModal = true,
}: SelectWidgetSettingsModalProps) => {
    const content = useGameContent().modals['select-multi'];
    const { player } = useAuth();
    const [checks, setChecks] = useState<Options>(options);

    const setCheck = (key: string, val: boolean) => {
        if (allowMultiple || isEmpty(checks)) setChecks({ ...checks, [key]: val });
    };

    const complete = () => {
        onFinalize(checks);
        // setChecks({});
    };
    const close = () => {
        // setChecks({});
        onClose && onClose();
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
    const renderMultiSelect = () => (
        <>
            <Text style={styles.text}>{title}</Text>
            <Text style={styles.text}>{dialogue}</Text>
            {Object.keys(options).map((id) => {
                //  TODO make scroll list. pushes button off screen when > 8 options
                return (
                    <CheckBox
                        key={id}
                        center
                        title={id.split('-').map(capitalize).join(' ')}
                        checkedIcon="dot-circle-o"
                        uncheckedIcon="circle-o"
                        checked={checks[id]}
                        onPress={() => setCheck(id, !checks[id])}
                    />
                );
            })}
            <View style={styles.buttonContainer}>
                <Button onPress={complete}>
                    {' '}
                    <Text>
                        {' '}
                        Save <Icon name="asl" color="white" type="foundation" />
                    </Text>{' '}
                </Button>
            </View>
        </>
    );

    return useModal ? (
        <BaseModal
            size="md"
            onClose={close}
            primaryButton={{
                button: (
                    <Button onPress={complete}>
                        {' '}
                        Save <Icon name="asl" color="white" type="foundation" />{' '}
                    </Button>
                ),
            }}
        >
            {renderMultiSelect()}
        </BaseModal>
    ) : (
        <View style={styles.container}>
            {renderMultiSelect()}
            <Button onPress={onClose} color="black">
                {' '}
                <Text style={{ color: 'white' }}>
                    {' '}
                    Back <Icon name="blind" color="white" type="foundation" />
                </Text>{' '}
            </Button>
        </View>
    );
};
const styles = StyleSheet.create({
    text: {
        fontSize: 24,
        fontWeight: '500',
    },
    buttonContainer: {
        bottom: 0,
    },
    container: {
        top: '8%',
        left: '10%',
        right: '10%',
        bottom: '10%',

        position: 'absolute',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 5,
    },
});

export default SelectModal;
