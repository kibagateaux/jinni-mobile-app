import React, { useState } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { isEmpty } from 'lodash';
import { CheckBox, Icon } from '@rneui/themed';

import { useGameContent } from 'contexts/GameContentContext';

import BaseModal from './BaseModal';
import { ItemIds, Resource } from 'types/GameMechanics';
import { Button } from '@rneui/themed';
import { itemAbilityToWidgetConfig } from 'utils/config';
import { WidgetConfig, WidgetIds } from 'types/UserConfig';
import { useAuth } from 'contexts/AuthContext';
import { saveHomeConfig } from 'utils/api';

export interface SelectWidgetSettingsModalProps {
    dialogueData?: object; // params for modal text
    allowMultiple?: boolean;
    initialSelects?: { [id: string]: boolean };
    provider: ItemIds;
    widgetId: WidgetIds;
    options: Resource[] | WidgetConfig[];
    onFinalize: (options: Resource[] | WidgetConfig[]) => void;
}

const SelectModal = ({
    dialogueData = {},
    options,
    allowMultiple,
    provider,
    widgetId,
    initialSelects,
    onFinalize,
}: SelectModalProps) => {
    const content = useGameContent().modals['select-multi'];
    const { player } = useAuth();
    const [checks, setChecks] = useState<{ [key: string]: boolean }>(initialSelects);

    const setCheck = (key: string, val: boolean) => {
        if (allowMultiple || isEmpty(checks)) setChecks({ ...checks, [key]: val });
    };

    const saveWidgets = async () => {
        if (!player?.id) return null;
        const widgets = Object.keys(checks)
            .filter((x) => x)
            .map(
                (k): WidgetConfig => ({
                    ...itemAbilityToWidgetConfig(provider, k as WidgetIds),
                    config: {
                        providerId: k, // TODO assumes widget config is provider dependent. ¿rename `value` or `config` and intepret on backend?
                    },
                }),
            );

        await saveHomeConfig({ username: player?.id, widgets });
        onFinalize(options);
    };

    console.log('Select options', widgetId, options);

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
                {options.map((item: WidgetConfig | Resource) => {
                    const itemId = item.routeName ? item.id : item.provider_id;
                    return (
                        <CheckBox
                            key={itemId}
                            center
                            title={item.name}
                            checkedIcon="dot-circle-o"
                            uncheckedIcon="circle-o"
                            checked={checks[itemId]}
                            onPress={() => setCheck(itemId, !checks[itemId])}
                        />
                    );
                })}
                <Button onPress={saveWidgets}>
                    {' '}
                    Save <Icon name="zap" color="white" type="foundation" />{' '}
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
