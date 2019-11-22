import React, { } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Modal, Platform, FlatList, Image } from "react-native";
import { scaleWidth, scaleHeight, normalizeFont } from '../components/common/Responsive';
import styles from '../components/styles/styles'
const { width, height } = Dimensions.get('window');
const ProfileAlert = (props) => {
    return (
        <Modal
            visible={props.visible}
            animationType="none"
            transparent={true}
            onRequestClose={props.onRequestClose}
        >
            <View style={styles.profileContainer}>
                <View style={[styles.profileModalView, { alignItems: 'center', justifyContent: 'center', }]}>
                    <Text>We are working on this !!</Text>
                </View>
                <TouchableOpacity
                    style={{
                        alignItems: 'center', justifyContent: 'center', marginTop: 5,
                        width: 70,
                        height: scaleHeight(30),
                        backgroundColor: '#D00E17',
                        borderRadius: 5,
                        alignItems: 'center',
                        marginTop: '8%',
                        borderBottomWidth: 2,
                        borderBottomColor: '#6E6E6E'
                    }} onPress={() => this.props.navigation.navigate('SelectGame')}>
                    <Text style={{ color: 'white', fontWeight: '600', fontSize: normalizeFont(16), paddingTop: 5 }}>OK</Text>
                </TouchableOpacity>

            </View>
        </Modal >
    )
}


export default ProfileAlert;