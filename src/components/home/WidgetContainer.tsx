import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Button } from 'react-native';
import DraggableFlatList, {
    ScaleDecorator,
    // ShadowDecorator,
    RenderItemParams,
} from 'react-native-draggable-flatlist';
import { TouchableOpacity /** GestureHAndler */ } from 'react-native-gesture-handler';
// import { useSharedValue, runOnJS } from 'react-native-reanimated';
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
    const [editMode, setEditMode] = useState<boolean>(false);
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

    // const addWidget = (widget: WidgetConfig) => () =>
    //     saveWidgets && saveWidgets([...widgets, widget]);

    // const removeWidget = (widget: WidgetConfig) => () =>
    //     saveWidgets && saveWidgets(filter(({ id }) => id !== widget.id)(widgets));

    const onRenovateEnd = ({ data }: { data: WidgetConfig[] }) => {
        console.log('draggable resordered', data);
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
    2;

    return (
        <View style={styles.widgets}>
            {editMode ? renderRenovationMode() : renderBaseMode()}
            {editMode ? ( // TODO use icons not buttons
                <>
                    <Button title="Close" onPress={onEditModeEnd} />
                    <Button title="Add Widget" />
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
