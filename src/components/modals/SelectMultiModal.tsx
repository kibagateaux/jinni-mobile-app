import React, { useState } from 'react';
import { Text, StyleSheet, View, ScrollView } from 'react-native';
import { capitalize, isEmpty } from 'lodash';
import { CheckBox } from '@rneui/themed';

import { useGameContent } from 'contexts/GameContentContext';

import BaseModal from './BaseModal';
import { Button } from '@rneui/themed';
import { mapValues } from 'lodash/fp';

type Options = { [id: string]: boolean }; // id = widget.id | resource.provider_id | human readable options
export interface SelectWidgetSettingsModalProps {
    dialogueData?: object; // params for modal text
    allowMultiple?: boolean; // if can check off multiple boxes
    backgroundColor?: string;
    options: Options; // can have preselected options
    onFinalize: (options: Options) => void;
    onClose?: (data?: unknown) => Promise<void | boolean>;
    useModal?: boolean;
}

const SelectModal = ({
    dialogueData = {},
    backgroundColor,
    options,
    allowMultiple,
    onClose,
    onFinalize,
    useModal = true,
    ...props
}: SelectWidgetSettingsModalProps) => {
    const content = useGameContent().modals['select-multi'];
    // const { player } = useAuth();
    const [checks, setChecks] = useState<Options>(options);

    const setCheck = (key: string, val: boolean) => {
        if (allowMultiple || isEmpty(checks)) return setChecks({ ...checks, [key]: val });
        // overwrite all past options so only most recent selected
        return setChecks({ ...mapValues(() => false, checks), [key]: val });
    };

    const complete = () => {
        console.log('finalise select multi modal!');

        onFinalize(checks);
        // setChecks({});
    };

    const close = (data: unknown) => {
        // setChecks({});
        onClose && onClose(data);
    };

    const titleTemplate = content.title;
    const dialogueTemplate = content.text;
    const title =
        typeof titleTemplate === 'function'
            ? titleTemplate(dialogueData)
            : dialogueData?.title ?? titleTemplate;
    const dialogue =
        typeof dialogueTemplate === 'function'
            ? dialogueTemplate(dialogueData)
            : dialogueData?.description ?? dialogueTemplate;

    const renderMultiSelect = () => (
        <>
            <Text style={styles.text}>{title ?? ''}</Text>
            <Text style={styles.text}>{dialogue ?? ''}</Text>
            <ScrollView>
                {!options
                    ? null
                    : Object.keys(options).map((id) => {
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
            </ScrollView>
            <View style={styles.buttonContainer}>
                <Button onPress={complete}>Save</Button>
            </View>
        </>
    );

    return useModal ? (
        <BaseModal
            size="md"
            {...props} // overwrite with our close
            backgroundColor={backgroundColor}
            onClose={close}
        >
            {renderMultiSelect()}
        </BaseModal>
    ) : (
        <View style={[styles.container, { backgroundColor: backgroundColor }]}>
            {renderMultiSelect()}
            <Button onPress={onClose} color="black">
                <Text style={{ color: 'white' }}>
                    Back {/*  <Icon name="blind" color="white" type="foundation" /> */}
                </Text>
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
