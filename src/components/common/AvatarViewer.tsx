import React from 'react';
import { View, PanResponder, Text } from 'react-native';
// import { GLView } from 'expo-gl';

interface AvatarViewerProps {
    uri?: string;
    SVG?: React.FC; // raw xml code
    is3d?: boolean;
}

const AvatarViewer = ({ SVG, uri, is3d }: AvatarViewerProps) => {
    let rotation = 0;
    const panResponder = PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (event, gestureState) => {
            rotation += gestureState.dx;
        },
    });

    if (!SVG && !uri) {
        return <Text>Spiritual connection lost. Cannot display your Jinni</Text>;
    }

    // console.log('AvatarViewer', { SVG, uri, is3d });

    const SvgComponent = () => (!SVG ? null : <SVG />);
    // TODO add suppoort for rendering base64 encoded images
    //  https://stackoverflow.com/questions/29380265/does-react-native-support-base64-encoded-images
    return (
        <View
            {...panResponder.panHandlers}
            style={{
                // TODO unhardcode this and egg/avatar SVG height/width with Dimension.get('window')
                width: 150,
                height: 200,
                // width: width * 0.5,
                // height: height * 0.75,
                transform: [{ rotateZ: `${rotation}deg` }],
            }}
        >
            {!is3d ? (
                <SvgComponent />
            ) : (
                <Text>3d Avatar Model</Text>
                // <GLView
                //   style={{ flex: 1 }}
                //   onContextCreate={async (gl: any) => {
                //     console.log("Rendering 3d avatar model", gl);
                //     // Note: This is where you'd add your 3D model rendering code
                //   }}
                // />
            )}
        </View>
    );
};

export default AvatarViewer;
