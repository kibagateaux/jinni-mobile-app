import { isEmpty } from 'lodash';
import React, { useMemo, useState } from 'react';
import { View, FlatList, StyleSheet, Button } from 'react-native';
import DraggableFlatList, {
    ScaleDecorator,
    // ShadowDecorator,
    RenderItemParams,
} from 'react-native-draggable-flatlist';
import { TouchableOpacity /** GestureHAndler */ } from 'react-native-gesture-handler';
// import { useSharedValue, runOnJS } from 'react-native-reanimated';

import { useInventory } from 'hooks/useInventory';
import SelectMultiModal from 'components/modals/SelectMultiModal';
import { WidgetConfig } from 'types/UserConfig';
interface WidgetContainerProps {
    widgets: WidgetConfig[];
    saveWidgets?: (widgets: WidgetConfig[]) => void;
    finalizeRenovation?: () => void; // send to server
    WidgetRenderer: React.FC<WidgetConfig>;
    renovationConfig?: object; // options for DraggableFlatList
}

const WidgetContainer = ({
    widgets,
    WidgetRenderer,
    saveWidgets,
    finalizeRenovation,
    renovationConfig = {},
}: WidgetContainerProps) => {
    // TODO https://reactnative.dev/docs/optimizing-flatlist-configuration
    // all vars used for renovations
    const [editMode, setEditMode] = useState<boolean>(false);
    const [addMode, setAddMode] = useState<boolean>(false);
    const { widgets: allWidgets } = useInventory();
    const [selectedWidgets, setSelectedWidgets] = useState<{ [key: string]: boolean }>({});

    useMemo(() => {
        if (editMode && !isEmpty(widgets) && isEmpty(selectedWidgets)) {
            // if none selected, hydrate from displayed widgets
            const selected = widgets.reduce(
                (agg: object, widgi: WidgetConfig) => ({
                    ...agg,
                    [widgi.id]: true,
                }),
                {},
            );

            console.log('comp:home:WidgiContain:selectedWdig', selected);
            setSelectedWidgets(selected);
        }
    }, [editMode, widgets, selectedWidgets]);

    // const _setEditMode = runOnJS(_setEditMode);

    // // TODO no buttons to enter renovate mode, just pres & hold widget module and it enters
    // // on hold down View, enter edit mode. React Native gesture handler
    // // might need to wrap everything in Gesture Detector and pass into DraggableList.simultaneousHandlers
    // // problem is its probs not a hook so not rerendering
    // const isEditMode = useSharedValue<boolean>(false);
    // console.log('state vs shared editMode', editMode, isEditMode.value);
    // const longPress = Gesture.LongPress()
    //     .minDuration(200) // hold 2 seconds to activate
    //     .onStart((event) => {
    //         // _setEditMode(true);
    //         console.log('Widgi: Gesture started!', event);
    //     })
    //     .onFinalize((event, success) => {
    //         console.log('Widgi: Gesture ended!', event, success);
    //         // _setEditMode(false);
    //     });

    // TODO implement add/remove

    const onWidgetsSelected = async (options: { [id: string]: boolean }) => {
        console.log('widgets selected for homepage', options);

        // TODO move to Widget Container onFinalize

        // TODO replace with  options.map(k => )
        // const widgets = Object.entries(checks)
        //     .filter(([key, val]) => val)
        //     .map(
        //         ([key, val]): WidgetConfig => ({
        //             ...itemAbilityToWidgetConfig(provider, key as WidgetIds),
        //             config: {
        //                 providerId: key, // TODO assumes widget config is provider dependent. ¿rename `value` or `config` and intepret on backend?
        //             },
        //         }),
        //     );

        // await saveHomeConfig({ username: player?.id, widgets });
    };
    // const addWidget = (widget: WidgetConfig) => () =>
    //     saveWidgets && saveWidgets([...widgets, widget]);

    // const removeWidget = (widget: WidgetConfig) => () =>
    //     saveWidgets && saveWidgets(filter(({ id }) => id !== widget.id)(widgets));

    const onRenovateEnd = ({ data }: { data: WidgetConfig[] }) => {
        // console.log('draggable resordered', data);
        if (saveWidgets) {
            saveWidgets(data);
        }
    };

    const onEditModeEnd = () => {
        console.log('end edit Mode');
        setEditMode(false);
        if (finalizeRenovation) finalizeRenovation();
    };

    const renderRenovationMode = () => {
        // console.log('Widgi:renovation');
        const defaultRenovationConfig = {
            dragItemOverflow: true,
            // debug: __DEV__ ? true : false,
        };
        return (
            <DraggableFlatList
                data={widgets}
                keyExtractor={(item) => item.id}
                onDragEnd={onRenovateEnd}
                renderItem={({ item, drag, isActive }: RenderItemParams<WidgetConfig>) => (
                    <ScaleDecorator>
                        <TouchableOpacity onLongPress={drag} disabled={isActive}>
                            {/* add delete icon button with onPress={removeWidget(item)} */}
                            <WidgetRenderer {...item} />
                        </TouchableOpacity>
                    </ScaleDecorator>
                )}
                {...defaultRenovationConfig}
                {...renovationConfig}
            />
        );
    };

    const renderBaseMode = () => {
        // console.log('Widgi:base');
        return (
            // <gesture={longPress}>
            <FlatList
                data={widgets}
                renderItem={({ item }: { item: WidgetConfig }) => <WidgetRenderer {...item} />}
                keyExtractor={(item) => item.id}
            />
            // <
        );
    };

    const renderAddWidgetModal = () => {
        const selectedWidgi = Object.keys(allWidgets)
            .map((k) => ({ [k]: find(widgets, { id: k }) ? true : false }))
            .reduce((agg, opt) => ({ ...agg, ...opt }), {});

        return (
            <SelectMultiModal
                options={selectedWidgi}
                allowMultiple
                onFinalize={onWidgetsSelected}
            />
        );
    };

    const showSelectedWigets = () => {
        setAddMode(true);
    };

    return (
        <View style={styles.widgets}>
            {editMode ? renderRenovationMode() : renderBaseMode()}
            {addMode ? renderAddWidgetModal() : null}
            {editMode ? ( // TODO use icons not buttons
                <>
                    <Button title="Close" onPress={onEditModeEnd} />
                    <Button title="Add Widget" onPress={showSelectedWigets} />
                </>
            ) : (
                <Button title="Renovate" onPress={() => setEditMode(true)} />
            )}
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        flex: 10,
    },
    widgets: {
        position: 'absolute',
        right: 0,
        flexDirection: 'column',
    },
    tabs: {
        flex: 0.2,
        flexDirection: 'row',
    },
});

export default WidgetContainer;
