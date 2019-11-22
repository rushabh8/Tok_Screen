import React, { } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Modal, FlatList, Image } from "react-native";
import { scaleWidth, scaleHeight, normalizeFont } from '../components/common/Responsive';
import styles from '../components/styles/styles'
const avatar = require('../image/create/default.png')
const { width, height } = Dimensions.get('window');

const InviteAlert = (props) => {
    return (
        <Modal
            visible={props.visible}
            animationType="none"
            transparent={true}
            onRequestClose={props.onRequestClose}
        >
            <View style={[styles.profileContainer, { justifyContent: 'center' }]}>
                <View style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: width - scaleWidth(40),
                    backgroundColor: 'transparent',
                    marginVertical: scaleHeight(50),
                    marginHorizontal: scaleWidth(20),
                }}>
                    <TouchableOpacity onPress={props.logoutModalClose} style={{ alignSelf: 'flex-end' }}>
                        <Image resizeMode="stretch" source={require('../image/Cross/cross.png')} />
                    </TouchableOpacity>
                    <FlatList
                        data={props.data}
                        renderItem={({ item, index }) =>
                            <View style={{ backgroundColor: '#fff', width: width - scaleWidth(60) }}>
                                <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => props.sendInvitation(index)}  >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 10 }}>
                                        <Image source={(item.avatar !== null || item.avatar === "") ? { uri: item.avatar } : avatar} style={{ height: scaleHeight(50), width: scaleWidth(50), marginVertical: scaleHeight(10) }} />
                                        <View style={{ flexDirection: 'column' }}>
                                            <Text style={{ marginLeft: scaleWidth(10), fontWeight: 'bold', fontSize: normalizeFont(18) }}>{item.name}</Text>
                                            <Text style={{ marginLeft: scaleWidth(10), fontWeight: 'bold', fontSize: normalizeFont(18), color: 'gray' }}>{item.email}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </View>}
                        keyExtractor={(item, index) => index.toString()}
                    />
                </View>
            </View>
        </Modal >
    )
}

export default InviteAlert;
