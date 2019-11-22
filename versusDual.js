import React, { Component } from 'react';
import {
    KeyboardAvoidingView, Text,
    View, Dimensions, ImageBackground,
    Image, Animated, AsyncStorage, Alert
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
        this.setState({ isLoading: true })
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

        // setTimeout(() => {
        // this.ViewProfile()
        //this.ViewOtherPlayerProfile()
        //this._createGameRoom()
        // }, 500);

        // setTimeout(() => {
        //     {
        //         this.state.gamePlayType == 'topten' ?
        //             this.props.navigation.navigate("QuestionTop10Dual", { data: otherPlayerData })
        //             :
        //             this.props.navigation.navigate("QuestionSmartSortDual", { data: otherPlayerData })

        //     }
        // }, 1000)

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

    // ************************* view user profile *****************************

    // ViewProfile = () => {
    //     let variables1 = {
    //         "userId": this.state.userId
    //     }
    //     let variables = {
    //         "userId": this.state.otherPlayerID
    //     }
    //     Promise.all([webservice(variables1, "users/viewProfile", "POST"), webservice(variables, "users/viewProfile", "POST")])
    //         .then(resp => {
    //             //console.log("test ====>" + JSON.stringify(resp))
    //             if (resp[0].data.responseCode === 200 && resp[1].data.responseCode === 200) {
    //                 this.setState({
    //                     isLoading: false,
    //                     name: resp[0].data.data[0].name,
    //                     avatar: resp[0].data.data[0].avatar,
    //                     win1: resp[0].data.data[0].win,
    //                     lose1: resp[0].data.data[0].lose,
    //                     otherPlayerName: resp[1].data.data[0].name,
    //                     otherPlayerAvatar: resp[1].data.data[0].avatar,
    //                     win2: resp[1].data.data[0].win,
    //                     lose2: resp[1].data.data[0].lose
    //                 })
    //                 setTimeout(() => {
    //                     this._createGameRoom()
    //                 }, 500);
    //             }
    //         })

    // let variables = {
    //     "userId": this.state.userId
    // }
    // return webservice(variables, "users/viewProfile", "POST")
    //     .then(resp => {
    //         if (resp.data.responseCode === 200) {
    //             this.setState({
    //                 name: resp.data.data[0].name,
    //                 avatar: resp.data.data[0].avatar,
    //                 win1: resp.data.data[0].win,
    //                 lose1: resp.data.data[0].lose
    //             })
    //         } else {
    //             //console.log(resp.data.responseMessage)
    //         }
    //     })
    // }

    // ************************* view user OTHER USER profile *****************************

    // ViewOtherPlayerProfile = () => {
    //     let variables = {
    //         "userId": this.state.otherPlayerID
    //     }
    //     return webservice(variables, "users/viewProfile", "POST")
    //         .then(resp => {
    //             this.setState({ isLoading: false })
    //             if (resp.data.responseCode === 200) {
    //                 //console.log("other player friend Data >>>>>", resp.data.data)
    //                 this.setState({
    //                     otherPlayerName: resp.data.data[0].name,
    //                     otherPlayerAvatar: resp.data.data[0].avatar,
    //                     win2: resp.data.data[0].win,
    //                     lose2: resp.data.data[0].lose
    //                 })
    //             } else {
    //                 //console.log(resp.data.responseMessage)
    //             }
    //         })
    // }

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
                        }, 1000)
                    }
                    else {
                        //console.log('====================================');
                        //console.log("game Room API failed   ", resp.data);
                        //console.log('====================================');
                        Alert.alert('TOK', 'Failed To Start Game. Please Try Again',
                            [{ text: 'Try Again', onPress: () => this._createGameRoom() }])
                    }
                })
        )
    }


    render() {
        const moveRightLeft = this.animatedValue0.interpolate({
            inputRange: [0, 1],
            outputRange: [10, 65]
        })
        const moveLeftRight = this.animatedValue1.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 65]
        })
        return (
            !this.state.isLoading ?
                <ImageBackground source={require('../image/Invite_friend/bg.png')} style={{ flex: 1 }} >
                    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
                        {/* {Platform.OS === 'ios' ?
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: scaleWidth(20), marginTop: scaleHeight(150) }}>
                                <Animated.View style={{
                                    left: Platform.OS === 'ios' ? moveLeftRight : null,
                                    marginTop: 75,
                                    height: scaleHeight(30),
                                    width: scaleWidth(40),
                                    justifyContent: 'center',
                                    alignItems: 'center',

                                }}>
                                    <Image source={this.state.win ? require('../image/result1/bluewin.png') : require('../image/result1/blue.png')} style={{ position: 'relative', height: scaleHeight(200), bottom: scaleHeight(-40) }} />
                                    <View style={{ justifyContent: 'center', alignItems: 'center', bottom: scaleHeight(100) }}>
                                        <Image source={(this.state.userProfile.avatar!= null || this.state.userProfile.avatar =='')?{ uri: this.state.userProfile.avatar }: defaultImage} style={{ height: scaleHeight(60), width: scaleWidth(60), position: 'absolute', zIndex: 1, }} />
                                    </View>
                                    <View style={{ position: 'absolute', zIndex: 1, top: scaleHeight(50), justifyContent: 'center', alignItems: 'center' }}>
                                        <Image source={require('../image/result1/text.png')} style={{}} />
                                        <Text style={{ color: 'white', fontSize: normalizeFont(14), fontWeight: '600', position: 'absolute', zIndex: 1, justifyContent: 'center', }}>{this.state.userProfile.name}</Text>
                                    </View>
                                    <View style={{ position: 'absolute', flexDirection: 'row', zIndex: 1, top: scaleHeight(90), justifyContent: 'center', alignItems: 'center' }}>
                                        <Image source={require('../image/edit_profile/like.png')} style={{ position: 'relative', width: scaleWidth(15), height: scaleHeight(15), marginHorizontal: scaleWidth(10) }} />
                                        <Text style={{ color: '#fff' }}>{this.state.userProfile.win}</Text>
                                        <Image source={require('../image/edit_profile/unlike.png')} style={{ position: 'relative', width: scaleWidth(15), height: scaleHeight(15), marginHorizontal: scaleWidth(10) }} />
                                        <Text style={{ color: '#fff' }}>{this.state.userProfile.lose}</Text>
                                    </View>
                                </Animated.View>
                                <Image source={require("../image/versus/Rectangle-21.png")} style={{ height: scaleHeight(300), width: scaleWidth(30), top: scaleHeight(-30) }} />
                                <Animated.View style={{
                                    right: Platform.OS === 'ios' ? moveRightLeft : null,
                                    marginTop: 75,
                                    height: scaleHeight(30),
                                    width: scaleWidth(40),
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                    <Image source={require('../image/result1/yellow.png')} style={{ height: scaleHeight(200), bottom: scaleHeight(-40) }} />
                                    <View style={{ justifyContent: 'center', alignItems: 'center', bottom: scaleHeight(100) }}>
                                        <Image source={(this.state.otherPlayerProfile.avatar != null || this.state.otherPlayerProfile.avatar =='')?{ uri: this.state.otherPlayerProfile.avatar }: defaultImage} style={{ height: scaleHeight(60), width: scaleWidth(60), position: 'absolute', zIndex: 1 }} />
                                    </View>
                                    <View style={{ position: 'absolute', zIndex: 1, top: scaleHeight(50), justifyContent: 'center', alignItems: 'center' }}>
                                        <Image source={require('../image/result1/text.png')} style={{ position: 'relative' }} />
                                        <Text style={{ color: 'white', fontSize: normalizeFont(14), fontWeight: '600', position: 'absolute', zIndex: 1, justifyContent: 'center', }}>{this.state.otherPlayerProfile.name}</Text>
                                    </View>
                                    <View style={{ position: 'absolute', flexDirection: 'row', zIndex: 1, top: scaleHeight(90), justifyContent: 'center', alignItems: 'center' }}>
                                        <Image source={require('../image/edit_profile/like.png')} style={{ position: 'relative', width: scaleWidth(15), height: scaleHeight(15), marginHorizontal: scaleWidth(10) }} />
                                        <Text style={{ color: '#fff' }}>{this.state.otherPlayerProfile.win}</Text>
                                        <Image source={require('../image/edit_profile/unlike.png')} style={{ position: 'relative', width: scaleWidth(15), height: scaleHeight(15), marginHorizontal: scaleWidth(10) }} />
                                        <Text style={{ color: '#fff' }}>{this.state.otherPlayerProfile.lose}</Text>
                                    </View>
                                </Animated.View>
                            </View>
                            : */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: scaleWidth(20), marginTop: scaleHeight(150) }}>
                            <View style={{
                                // left: Platform.OS === 'ios' ? moveLeftRight : null,
                                marginTop: 75,
                                left: scaleWidth(50),
                                height: scaleHeight(30),
                                width: scaleWidth(40),
                                justifyContent: 'center',
                                alignItems: 'center',

                            }}>
                                <Image source={this.state.win ? require('../image/result1/bluewin.png') : require('../image/result1/blue.png')} style={{ position: 'relative', height: scaleHeight(200), bottom: scaleHeight(-40) }} />
                                <View style={{ justifyContent: 'center', alignItems: 'center', bottom: scaleHeight(100) }}>
                                    <Image source={this.state.userProfile.avatar ? { uri: this.state.userProfile.avatar } : defaultImage} style={{ height: scaleHeight(60), width: scaleWidth(60), position: 'absolute', zIndex: 1, }} />
                                </View>
                                <View style={{ position: 'absolute', zIndex: 1, top: scaleHeight(50), justifyContent: 'center', alignItems: 'center' }}>
                                    <Image source={require('../image/result1/text.png')} style={{}} />
                                    <Text numberOfLines={1} ellipsizeMode='tail' style={{ width: scaleWidth(100), textAlign: 'center', color: 'white', fontSize: normalizeFont(14), fontWeight: '600', position: 'absolute', zIndex: 1, justifyContent: 'center', }}>{this.state.userProfile.name}</Text>
                                </View>
                                <View style={{ position: 'absolute', flexDirection: 'row', zIndex: 1, top: scaleHeight(90), justifyContent: 'center', alignItems: 'center' }}>
                                    <Image source={require('../image/edit_profile/like.png')} style={{ position: 'relative', width: scaleWidth(15), height: scaleHeight(15), marginHorizontal: scaleWidth(10) }} />
                                    <Text style={{ color: '#fff' }}>{this.state.userProfile.win}</Text>
                                    <Image source={require('../image/edit_profile/unlike.png')} style={{ position: 'relative', width: scaleWidth(15), height: scaleHeight(15), marginHorizontal: scaleWidth(10) }} />
                                    <Text style={{ color: '#fff' }}>{this.state.userProfile.lose}</Text>
                                </View>
                            </View>
                            <Image source={require("../image/versus/Rectangle-21.png")} style={{ height: scaleHeight(300), width: scaleWidth(30), top: scaleHeight(-30) }} />
                            <View style={{
                                // right: Platform.OS === 'ios' ? moveRightLeft : null,
                                marginTop: 75,
                                right: scaleWidth(50),
                                height: scaleHeight(30),
                                width: scaleWidth(40),
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <Image source={require('../image/result1/yellow.png')} style={{ height: scaleHeight(200), bottom: scaleHeight(-40) }} />
                                <View style={{ justifyContent: 'center', alignItems: 'center', bottom: scaleHeight(100) }}>
                                    <Image source={this.state.otherPlayerProfile.avatar ? { uri: this.state.otherPlayerProfile.avatar } : defaultImage} style={{ height: scaleHeight(60), width: scaleWidth(60), position: 'absolute', zIndex: 1 }} />
                                </View>
                                <View style={{ position: 'absolute', zIndex: 1, top: scaleHeight(50), justifyContent: 'center', alignItems: 'center' }}>
                                    <Image source={require('../image/result1/text.png')} style={{ position: 'relative' }} />
                                    <Text numberOfLines={1} ellipsizeMode='tail' style={{ width: scaleWidth(100), textAlign: 'center', color: 'white', fontSize: normalizeFont(14), fontWeight: '600', position: 'absolute', zIndex: 1, justifyContent: 'center', }}>{this.state.otherPlayerProfile.name}</Text>
                                </View>
                                <View style={{ position: 'absolute', flexDirection: 'row', zIndex: 1, top: scaleHeight(90), justifyContent: 'center', alignItems: 'center' }}>
                                    <Image source={require('../image/edit_profile/like.png')} style={{ position: 'relative', width: scaleWidth(15), height: scaleHeight(15), marginHorizontal: scaleWidth(10) }} />
                                    <Text style={{ color: '#fff' }}>{this.state.otherPlayerProfile.win}</Text>
                                    <Image source={require('../image/edit_profile/unlike.png')} style={{ position: 'relative', width: scaleWidth(15), height: scaleHeight(15), marginHorizontal: scaleWidth(10) }} />
                                    <Text style={{ color: '#fff' }}>{this.state.otherPlayerProfile.lose}</Text>
                                </View>
                            </View>
                        </View>
                        {/* } */}
                        <Image source={require("../image/versus/Group-1.png")} style={{ height: scaleHeight(100), width: scaleWidth(330), top: scaleHeight(-40), marginHorizontal: scaleWidth(25) }} />


                    </KeyboardAvoidingView>
                </ImageBackground>
                :
                <Loader visible={this.state.isLoading} />

        )
    }
}