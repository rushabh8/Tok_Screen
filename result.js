import React, { Component } from 'react';
import { KeyboardAvoidingView, Text, View, StyleSheet, ImageBackground, AsyncStorage, Image, Dimensions } from 'react-native';
import { userProfileData, otherUserProfileData } from '../webService/ApiStore'
import webservice from '../webService/Api'
import { scaleWidth, scaleHeight, normalizeFont } from '../components/common/Responsive';
import { MusicFunc } from '../components/common/SoundFunc';
import Textellipsis from '../components/common/Textellipsis';

const { width, height } = Dimensions.get('window')
const profileImage = require('../image/notification/Image.png');

export default class result extends Component {
    constructor(props) {
        super(props);
        this.state = {
            score1: '',
            score2: '',
            win: true,
            gamePlayType: '',
            gameObj: null,
            userProfileData,
            otherUserProfileData
                     }
    }

    

    componentDidMount() {
        let { params } = this.props.navigation.state
        this.setState({
            gameObj: params.gameObj,
            score1: params.gameObj.score1,
            score2: params.gameObj.score2,
            win: params.gameObj.winStatus,
            gamePlayType: params.gameObj.gamePlayType
        })
        AsyncStorage.getItem('userId').then(userId => this.setState({ userId: JSON.parse(userId) }))
        AsyncStorage.getItem('gameRoomId').then(gameRoomId => this.setState({ gameRoomId: JSON.parse(gameRoomId) }))
        setTimeout(() => {
            this._saveGameHistory()
        }, 500);
    }

    //  ******************** save game history ********************

    _saveGameHistory() {
        let variables = {
            "userId": this.state.userId,
            "gameRoomId": this.state.gameRoomId,
            "totalScore": this.state.score1,
            "win": JSON.stringify(this.state.win),
            "lose": JSON.stringify(!this.state.win)
        }
        return webservice(variables, "topTen/saveGameHistory", "POST")
            .then(resp => {
                if (resp.data.responseCode === 200) {
                    this.setState({ isLoading: false })
                    setTimeout(() => {
                        this.state.gamePlayType === 'topten' ?
                            this.props.navigation.navigate("GameComplete", { gameObj: this.state.gameObj })
                            : this.props.navigation.navigate("GameCompleteSmartSort", { gameObj: this.state.gameObj })
                    }, 3300);
                }
                else if (resp.data.responseCode === 400) {
                    alert(JSON.stringify(resp.data.responseMessage))
                }
                else if (resp.data.responseCode === 1000) {
                    alert(resp.data.responseMessage)
                }

            })
    }

    _winning() {
        MusicFunc('Winner_Music', 'play')
        return (
            <Text style={{ color: '#D00E17', fontSize: normalizeFont(30), fontWeight: "800" }}>You Won</Text>
        )
    }

    _losing() {
        MusicFunc('Losing_Music', 'play')
        return (
            <Text style={{ color: '#D00E17', fontSize: normalizeFont(30), fontWeight: "800" }}>You Lose</Text>
        )
    }

    render() {
        return (
            <ImageBackground source={require('../image/Invite_friend/bg.png')} style={{ flex: 1, paddingTop: scaleHeight(20) }} >
                <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: scaleWidth(5), width: width - scaleWidth(10) }}>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ shadowColor: 'black' }}>
                                <Text style={{ fontWeight: 'bold', textAlign: 'center' }}>
                                 <Textellipsis mytextvar={this.state.userProfileData.name} maxlimit={15} ></Textellipsis>
                                </Text>
                                <Image source={this.state.userProfileData.avatar ? { uri: this.state.userProfileData.avatar } : profileImage} style={{ width: scaleWidth(80), height: scaleHeight(100), borderRadius: 10, borderColor: 'white', borderWidth: 5, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.5, shadowRadius: 1 }} resizeMode="stretch" />
                            </View>
                            <ImageBackground source={require('../image/Gameplay/Bluescroce.png')} style={{ alignSelf: 'center', justifyContent: 'center', alignItems: 'center', width: scaleWidth(45), paddingVertical: scaleHeight(7.5), paddingHorizontal: scaleWidth(5), }} resizeMode='contain'>
                                <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: normalizeFont(16),padding:3 }}>{this.state.score1}</Text>
                            </ImageBackground>
                        </View>

                        <ImageBackground source={require('../image/Gameplay/clock.png')} resizeMode='contain' style={{ bottom: 25, width: scaleWidth(80), height: scaleHeight(80), justifyContent: 'center', alignItems: "center" }} >
                            <Text ref={ref => this.clock = ref} style={{ color: 'white', fontSize: normalizeFont(22), top: scaleHeight(2), }}>15</Text>
                        </ImageBackground>

                        <View style={{ flexDirection: 'row' }}>
                            <ImageBackground source={require('../image/Gameplay/Orangescore.png')} style={{ alignSelf: 'center', justifyContent: 'center', alignItems: 'center', width: scaleWidth(45), paddingVertical: scaleHeight(7.5), paddingHorizontal: scaleWidth(5), }} resizeMode='contain'>
                                <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: normalizeFont(16),padding:3  }}>{this.state.score2}</Text>
                            </ImageBackground>
                            <View style={{ shadowColor: 'black' }}>
                                <Text style={{ fontWeight: 'bold', textAlign: 'center' }}>
                                <Textellipsis mytextvar={this.state.otherUserProfileData.name} maxlimit={15}></Textellipsis>
                                </Text>
                                <Image source={this.state.otherUserProfileData.avatar ? { uri: this.state.otherUserProfileData.avatar } : profileImage} style={{ width: scaleWidth(80), height: scaleHeight(100), borderRadius: 10, borderColor: 'white', borderWidth: 5, shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.5, shadowRadius: 1 }} resizeMode="stretch" />
                            </View>
                        </View>
                    </View>

                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        {this.state.win ? this._winning() : this._losing()}
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: scaleWidth(20), marginTop: scaleHeight(50) }}>
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <ImageBackground source={require('../image/result1/blue.png')} style={{ justifyContent: 'center', alignItems: 'center', width: scaleWidth(150), height: height / 4 }} resizeMode='contain'>
                                <Image source={{ uri: this.state.userProfileData.avatar }} style={{ height: scaleHeight(70), width: scaleWidth(70) }} resizeMode='contain' />
                                <ImageBackground source={require('../image/result1/text.png')} style={{ width: scaleWidth(100), height: scaleHeight(20), marginVertical: scaleHeight(2.5), justifyContent: 'center', alignItems: 'center' }} resizeMode="stretch" >
                                    <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: 'white', fontWeight: '600', fontSize: normalizeFont(14), width: scaleWidth(80), textAlign: 'center' }}>{this.state.userProfileData.name}</Text>
                                </ImageBackground>
                                <View style={{ flexDirection: 'row', width: scaleWidth(80), alignItems: 'center', justifyContent: 'center', marginVertical: scaleHeight(1), paddingHorizontal: 5 }}>
                                    <ImageBackground source={require('../image/result1/text.png')} style={{ width: scaleWidth(100), height: scaleHeight(20), marginVertical: scaleHeight(2.5), justifyContent: 'center', alignItems: 'center' }} resizeMode="stretch" >
                                        <Text style={{ color: '#fff' }}>SCORE:{this.state.score1}</Text>
                                    </ImageBackground>
                                </View>
                            </ImageBackground>
                        </View>
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <ImageBackground source={require('../image/result1/yellow.png')} style={{ justifyContent: 'center', alignItems: 'center', width: scaleWidth(150), height: height / 4 }} resizeMode='contain'>
                                <Image source={{ uri: this.state.otherUserProfileData.avatar }} style={{ height: scaleHeight(70), width: scaleWidth(70) }} resizeMode='contain' />
                                <ImageBackground source={require('../image/result1/text.png')} style={{ width: scaleWidth(100), height: scaleHeight(20), marginVertical: scaleHeight(2.5), justifyContent: 'center', alignItems: 'center' }} resizeMode="stretch" >
                                    <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: 'white', fontWeight: '600', fontSize: normalizeFont(14), width: scaleWidth(80), textAlign: 'center' }}>{this.state.otherUserProfileData.name}</Text>
                                </ImageBackground>
                                <View style={{ flexDirection: 'row', width: scaleWidth(80), alignItems: 'center', justifyContent: 'center', marginVertical: scaleHeight(1), paddingHorizontal: 5 }}>
                                    <ImageBackground source={require('../image/result1/text.png')} style={{ width: scaleWidth(100), height: scaleHeight(20), marginVertical: scaleHeight(2.5), justifyContent: 'center', alignItems: 'center' }} resizeMode="stretch" >
                                        <Text style={{ color: '#fff' }}>SCORE:{this.state.score2}</Text>
                                    </ImageBackground>
                                </View>
                            </ImageBackground>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </ImageBackground >
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
    },
    termsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20
    },
    terms: {
        fontSize: 20,
        color: 'black',
        fontWeight: '800',
        textAlign: 'center',
        marginVertical: 30
    }
});