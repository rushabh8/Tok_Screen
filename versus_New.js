import React, { Component } from 'react';
import {
    KeyboardAvoidingView, Text,
    View, Dimensions, ImageBackground, ToastAndroid,
    Image, Animated, AsyncStorage, Alert, BackHandler
} from 'react-native';
import { scaleWidth, scaleHeight, normalizeFont } from '../components/common/Responsive';
import Loader from './loader'
import webservice from '../webService/Api';
import { MusicFunc } from '../components/common/SoundFunc';

const { width, height } = Dimensions.get('window');
const defaultImage = require('../image/user.png')

export default class VersusDual extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            score1: '',
            score2: '',
            win: true,
            userProfile: '',
            otherPlayerProfile: '',
            userId: '',
            name: '',
            avatar: '',
            otherPlayerID: '',
            otherPlayerName: '',
            otherPlayerAvatar: '',
            win1: '',
            win2: '',
            lose1: '',
            lose2: '',
            gamePlayType: ''
        }
        this.animatedValue0 = new Animated.Value(0);
        this.animatedValue1 = new Animated.Value(0);
    }

    componentDidMount() {
        // this.setState({ isLoading: true })
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
        let { params } = this.props.navigation.state
        otherPlayerData = {
            playGameWith: params.userData.playGameWith,
            otherPlayerId: params.userData.userId,
            image2: params.userData.avatar,
            friendName: params.userData.name,
            gamePlayType: params.gamePlayType
        }
        this.setState({ otherPlayerProfile: params.userData, otherPlayerID: params.userData.userId, gamePlayType: params.gamePlayType })
        this.animate();

        AsyncStorage.getItem('MyProfileData').then((profile) => {
            this.setState({ userProfile: JSON.parse(profile), isLoading: false })
            setTimeout(() => {
                this._createGameRoom()
            }, 500);
        })
        AsyncStorage.getItem('userId').then((id) => this.setState({ userId: JSON.parse(id) }))
        AsyncStorage.getItem('subCategoryId').then((resp) => this.setState({ selectedSubCategoryId: resp }))
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    }

    // ********************* handle Back Button **********************
    handleBackButton = () => {
        ToastAndroid.show('You can not go back from this page using back button', ToastAndroid.SHORT);
        // this.props.navigation.goBack();
        return true;
    }

    animate() {
        this.animatedValue0.setValue(0);
        this.animatedValue1.setValue(0);

        const createAnimation = (value, duration, delay = 0) => {
            return Animated.timing(
                value,
                {
                    toValue: 1,
                    duration,
                    delay
                }
            )
        }
        Animated.parallel([
            createAnimation(this.animatedValue1, 2000),
            createAnimation(this.animatedValue0, 2000),
        ]).start();
    }

    // ************************* create Game Room *****************************

    _createGameRoom() {
        let variables = {
            "sendRequestBy": this.state.userId,
            "gameType": this.state.gamePlayType,
            "severity": "Easy",
            "categoryId": this.state.selectedSubCategoryId,
            "gameMode": "DULE",
            // "sendRequestTo": otherUserId
        }
        return (
            webservice(variables, "users/createGameRoomtop10", "POST")
                .then((resp) => {
                    if (resp.data.responseCode === 200) {
                        AsyncStorage.setItem('gameRoomId', JSON.stringify(resp.data.data.gameId))
                        MusicFunc('Opponent_Selection_Music', 'stop')
                        setTimeout(() => {
                            {
                                this.state.gamePlayType == 'topten' ?
                                    this.props.navigation.navigate("QuestionTop10Dual", { data: otherPlayerData, gamePlayType: this.state.gamePlayType })
                                    :
                                    this.props.navigation.navigate("QuestionSmartSortDual", { data: otherPlayerData, gamePlayType: this.state.gamePlayType })
                            }
                        }, 2000)
                    }
                    else {
                        Alert.alert('TOK', 'Failed To Start Game. Please Try Again',
                            [{ text: 'Try Again', onPress: () => this._createGameRoom() }])
                    }
                })
        )
    }


    render() {
        const left = this.animatedValue0.interpolate({
            inputRange: [0, 1],
            outputRange: [-500, (width * 20) / width]
        })
        const right = this.animatedValue1.interpolate({
            inputRange: [0, 1],
            outputRange: [-500, 20]
        })
        return (
            !this.state.isLoading ?
                <ImageBackground source={require('../image/Invite_friend/bg.png')} style={{ flex: 1, justifyContent: 'center' }} >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Animated.View style={{ left, justifyContent: 'center', alignItems: 'center' }}>
                            <ImageBackground source={require('../image/result1/blue.png')} style={{ justifyContent: 'center', alignItems: 'center', width: scaleWidth(150), height: height / 4 }} resizeMode='contain'>
                                <Image source={this.state.userProfile.avatar ? { uri: this.state.userProfile.avatar } : defaultImage} style={{ height: scaleHeight(70), width: scaleWidth(70) }} resizeMode='contain' />
                                <ImageBackground source={require('../image/result1/text.png')} style={{ width: scaleWidth(100), height: scaleHeight(20), marginVertical: scaleHeight(2.5), justifyContent: 'center', alignItems: 'center' }} resizeMode='contain' >
                                    <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: 'white', fontWeight: '600', fontSize: normalizeFont(14), width: scaleWidth(80), textAlign: 'center' }}>{this.state.userProfile.name}</Text>
                                </ImageBackground>
                                <View style={{ flexDirection: 'row', width: scaleWidth(80), alignItems: 'center', justifyContent: 'center', marginVertical: scaleHeight(0.5), paddingHorizontal: 5 }}>
                                    <Image source={require('../image/edit_profile/like.png')} style={{ width: scaleWidth(15), height: scaleHeight(25), marginHorizontal: scaleWidth(10) }} resizeMode='contain' />
                                    <Text style={{ color: '#fff' }}>{this.state.userProfile.win}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', width: scaleWidth(80), alignItems: 'center', justifyContent: 'center', marginVertical: scaleHeight(1), paddingHorizontal: 5 }}>
                                    <Image source={require('../image/edit_profile/unlike.png')} style={{ width: scaleWidth(15), height: scaleHeight(25), marginHorizontal: scaleWidth(10) }} resizeMode='contain' />
                                    <Text style={{ color: '#fff' }}>{this.state.userProfile.lose}</Text>
                                </View>
                            </ImageBackground>
                        </Animated.View>
                        <Image source={require("../image/versus/Rectangle-21.png")} style={{ height: height - scaleHeight(400), width: scaleWidth(40) }} resizeMode='stretch' />
                        <Animated.View style={{ right, justifyContent: 'center', alignItems: 'center' }}>
                            <ImageBackground source={require('../image/result1/yellow.png')} style={{ justifyContent: 'center', alignItems: 'center', width: scaleWidth(150), height: height / 4 }} resizeMode='contain'>
                                <Image source={this.state.otherPlayerProfile.avatar ? { uri: this.state.otherPlayerProfile.avatar } : defaultImage} style={{ height: scaleHeight(70), width: scaleWidth(70) }} resizeMode='contain' />
                                <ImageBackground source={require('../image/result1/text.png')} style={{ width: scaleWidth(100), height: scaleHeight(20), marginVertical: scaleHeight(2.5), justifyContent: 'center', alignItems: 'center' }} resizeMode='contain' >
                                    <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: 'white', fontWeight: '600', fontSize: normalizeFont(14), width: scaleWidth(80), textAlign: 'center' }}>{this.state.otherPlayerProfile.name}</Text>
                                </ImageBackground>
                                <View style={{ flexDirection: 'row', width: scaleWidth(80), alignItems: 'center', justifyContent: 'center', marginVertical: scaleHeight(0.5), paddingHorizontal: 5 }}>
                                    <Image source={require('../image/edit_profile/like.png')} style={{ width: scaleWidth(15), height: scaleHeight(25), marginHorizontal: scaleWidth(10) }} resizeMode='contain' />
                                    <Text style={{ color: '#fff' }}>{this.state.otherPlayerProfile.win}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', width: scaleWidth(80), alignItems: 'center', justifyContent: 'center', marginVertical: scaleHeight(1), paddingHorizontal: 5 }}>
                                    <Image source={require('../image/edit_profile/unlike.png')} style={{ width: scaleWidth(15), height: scaleHeight(25), marginHorizontal: scaleWidth(10) }} resizeMode='contain' />
                                    <Text style={{ color: '#fff' }}>{this.state.otherPlayerProfile.lose}</Text>
                                </View>
                            </ImageBackground>
                        </Animated.View>
                    </View>
                    <Image source={require("../image/versus/Group-1.png")} style={{ height: scaleHeight(120), width: width - scaleWidth(20), marginHorizontal: scaleWidth(10), bottom: scaleHeight(30) }} resizeMode='cover' />
                </ImageBackground>
                :
                <Loader visible={this.state.isLoading} />

        )
    }
}