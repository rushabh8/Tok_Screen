import React from 'react';
import { View, Text, TouchableOpacity, Modal, ImageBackground } from "react-native";
import { scaleWidth, scaleHeight, normalizeFont } from '../components/common/Responsive';
import Textellipsis from '../components/common/Textellipsis';
import styles from '../components/styles/styles'
const offlineRequestModal = (props) => {
    return (
        <Modal
            visible={true}
            animationType="none"
            transparent={true}
            onRequestClose={props.onRequestClose}
        >
            <View style={[styles.profileContainer, { justifyContent: 'center' }]}>
                <View style={[styles.answerModalView, { alignItems: 'center', justifyContent: 'center', height: scaleHeight(120), position: 'relative', }]}>
                    <Text style={{ fontSize: normalizeFont(20), fontWeight: '500', padding: 10, }}>
                        <Text style={{ fontSize: normalizeFont(20), fontWeight: 'bold' }}><Textellipsis mytextvar={props.userName.toUpperCase()} maxlimit={15} ></Textellipsis> is offline</Text>
                    </Text>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: scaleHeight(10) }}>
                        <TouchableOpacity onPress={props.OkPress}>
                            <ImageBackground source={require('../image/Gameplay/green.png')} style={{ height: scaleHeight(30), width: scaleWidth(65), marginHorizontal: scaleWidth(30) }}>
                                <Text style={{ fontSize: normalizeFont(18), color: '#fff', fontWeight: 'bold', textAlign: 'center', top: scaleHeight(2) }}>Ok</Text>
                            </ImageBackground>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal >
    )
}

export default offlineRequestModal;