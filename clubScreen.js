import React, { Component } from 'react';
import { KeyboardAvoidingView, TouchableOpacity, StyleSheet, Text, FlatList, View, ImageBackground, Platform, ScrollView, Image } from 'react-native';
import { scaleHeight } from '../components/common/Responsive';
const uncheck = require('../image/club/uncheck.png')
const check = require('../image/club/check.png')
export default class ClubScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [
                { image: require('../image/club/image.png'), email: 'test15@gmail.com', name: 'test15', isChecked: false },
                { image: require('../image/club/image.png'), email: 'test15@gmail.com', name: 'test15', isChecked: false },
                { image: require('../image/club/image.png'), email: 'test15@gmail.com', name: 'test15', isChecked: false },
            ],
            checked: false
        }
    }

    onSelect(i, item) {
        let { data } = this.state
        let target = data[i]
        target.isChecked = !target.isChecked
        this.setState({ data })
    }

    render() {
        return (
            <ImageBackground source={require('../image/Invite_friend/bg.png')} style={{ flex: 1 }} >
                <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
                    <ScrollView keyboardShouldPersistTaps='always' style={[styles.commonContainer, { marginTop: Platform.OS == 'ios' ? scaleHeight(80) : scaleHeight(110) }]}>
                        <FlatList
                            keyExtractor={(item, index) => index.toString()}
                            extraData={this.state}
                            data={this.state.data}
                            renderItem={({ item, index }) =>
                                <View style={{ paddingHorizontal: 15, marginVertical: 10, flexDirection: 'row', backgroundColor: 'transparent', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2, borderBottomColor: 'grey', borderBottomWidth: 1 }}>
                                    <View style={{ marginBottom: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                        <Image source={item.image} resizeMode='stretch' />
                                        <View style={{ left: 5 }}>
                                            <Text multiline={true} style={{ fontSize: 17, fontWeight: '800', bottom: 5, color: 'black' }} numberOfLines={1}>{item.name}</Text>
                                            <Text multiline={true} style={{ fontSize: 17, color: 'black' }} numberOfLines={1}>{item.email}</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity onPress={() => this.onSelect(index, item)}>
                                        <Image source={item.isChecked ? check : uncheck} resizeMode='stretch' />
                                    </TouchableOpacity>
                                </View>
                            }
                        />
                    </ScrollView>
                </KeyboardAvoidingView>
            </ImageBackground>

        )
    }
}

const styles = StyleSheet.create({


})