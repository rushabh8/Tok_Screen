import React, { } from 'react';
import { View, Modal, Image } from "react-native";
import { scaleWidth, scaleHeight } from '../components/common/Responsive';
import styles from '../components/styles/styles'

const Loader = (props) => {
    return (
        <Modal
            visible={props.visible}
            animationType="none"
            transparent={true}
            onRequestClose={props.onRequestClose}
        >
            <View style={styles.profileContainer}>
                <View style={{ alignItems: 'center', justifyContent: "center", flex: 1 }}>
                    <Image resizeMode="stretch" source={require('../image/GIF/loader_anim.gif')} style={{ height: scaleHeight(100), width: scaleWidth(100) }} />
                </View>
            </View>
        </Modal >
    )
}

export default Loader;