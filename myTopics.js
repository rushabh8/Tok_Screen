import React, { Component } from 'react';
import { KeyboardAvoidingView, Alert, TouchableOpacity, FlatList, AsyncStorage, Text, View, Dimensions, ImageBackground, ScrollView, Image } from 'react-native';
import { scaleWidth, scaleHeight, normalizeFont } from '../components/common/Responsive';
import { MusicFunc } from '../components/common/SoundFunc'
import webservice from '../webService/Api';
import { userProfileData } from '../webService/ApiStore';
import SelectMode from './selectMode';
import Loader from './loader';

const { width, height } = Dimensions.get('window');
const avatar = require('../image/create/default.png')

export default class MyTopics extends Component {
    constructor(props) {
        disabled = false
        super(props);
        this.state = {
            myTopics: [],
            name: '',
            isLoading: false,
            gamePlayType: '',
        }
    }

    componentDidMount() {
        const { params } = this.props.navigation.state
        this.setState({ gamePlayType: params.gamePlayType })
        SelectMode._dataRefresh(this.refresh_topic)
        AsyncStorage.getItem('userId').then((userId) => this.setState({ userId: JSON.parse(userId) }))
        this.getAvailableData()
    }

    refresh_topic = () => {
        this.viewProfile()
    }

    getAvailableData() {
        if (!userProfileData) {
            this.setState({ isLoading: true }, () => this.viewProfile())
        }
        else {
            this.setState({
                myTopics: userProfileData.interests,
                name: userProfileData.name
            })
        }
    }

    viewProfile = () => {
        let variables = {
            "userId": this.state.userId
        }
        return webservice(variables, "users/viewProfile", "POST")
            .then(resp => {
                this.setState({ isLoading: false })
                if (resp.data.responseCode === 200) {
                    this.setState({
                        myTopics: resp.data.data[0].interests,
                        name: resp.data.data[0].name
                    })
                }
                else if (resp.data.responseCode === 1000) {
                    this.setState({ isLoading: false }, () => { Alert.alert('TOK', resp.data.responseMessage, [{ text: 'Try Again', onPress: () => this.viewProfile() }]) })
                }
            })
    }

    _onSelectTopic(_id, name, image) {
        if (this.disabled) return;
        this.disabled = true;
        setTimeout(() => {
            this.disabled = false;
        }, 500);
        this.props.navigation.navigate('SelectMode', { subCategoryId: _id, subCategoryName: name, image: image, name: this.state.name, gamePlayType: this.state.gamePlayType })
    }

    render() {
        return (
            <ImageBackground source={require('../image/Invite_friend/bg.png')} style={{ flex: 1 }} >
                <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
                    <Loader visible={this.state.isLoading} />
                    <ScrollView keyboardShouldPersistTaps='always' style={{ flex: 1, marginHorizontal: 10, marginVertical: 10, width, top: scaleHeight(50) }}>
                        <FlatList
                            data={this.state.myTopics}
                            renderItem={({ item, index }) =>
                                <View>
                                    <TouchableOpacity onPress={() => { this._onSelectTopic(item._id, item.subCategoryName, item.imageUrl), MusicFunc('Button_Click_Music'), AsyncStorage.setItem('subCategoryId', item._id) }}
                                        style={{ height: scaleHeight(100), width: scaleWidth(80), flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: scaleHeight(10), marginHorizontal: scaleWidth(20), shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.5, shadowRadius: 1, }}>
                                        <Image source={(item.imageUrl !== null || item.imageUrl === "") ? { uri: item.imageUrl } : avatar}
                                            style={{ width: scaleWidth(90), height: scaleHeight(80), borderRadius: 10, borderColor: 'white', borderWidth: 5, }} />
                                    </TouchableOpacity>
                                    <Text style={{ fontSize: normalizeFont(14), color: 'black', alignSelf: 'center', width: scaleWidth(90), textAlign: 'center' }}>{item.subCategoryName}</Text>
                                </View>
                            }
                            keyExtractor={(item, index) => index}
                            horizontal={false}
                            numColumns={3}
                        />
                    </ScrollView>
                </KeyboardAvoidingView>
            </ImageBackground>
        )
    }
}
