import React, { Component } from 'react';
import {
    Text,
    View,
    ImageBackground,
    TouchableOpacity,
    Image,
    KeyboardAvoidingView,
    AsyncStorage,
    Dimensions
} from 'react-native';
import webservice from '../webService/Api';
import styles from '../components/styles/styles'
import { scaleWidth, scaleHeight, normalizeFont } from '../components/common/Responsive';
import { MusicFunc } from '../components/common/SoundFunc';
const { width, height } = Dimensions.get('window')
export default class SelectType extends Component {
    disabled = false;
    constructor(props) {
        super(props);
        this.state = {
            userId: '',
            onlineFriends: [],
            gamePlayType: ''
        }
    }

    componentDidMount() {
        let { params } = this.props.navigation.state
        this.setState({ gamePlayType: params.gamePlayType })
        selectedSubCategory = params.subCategoryId
        AsyncStorage.getItem('userId')
            .then((resp) => {
                this.setState({ userId: JSON.parse(resp) })
            })
        this.setState({ isLoading: true })
    }

    componentWillUnmount() {
        MusicFunc('Background_Music', 'stop')
    }

    getOnlineFriends() {
        let variables = {
            "id": this.state.userId
        }
        return webservice(variables, "users/getOnlineFriends", "POST")
            .then(resp => {
                if (resp.data.responseCode === 200) {
                    this.setState({
                        onlineFriends: resp.data.data
                    })
                }
                else if (resp.data.responseCode === 400) {
                    alert("400--" + resp.data.responseMessage)
                }
                else if (resp.data.responseCode === 1000) {
                    this.setState({ isLoading: false }, () => { alert(resp.data.responseMessage) })
                }
            })
    }

    _selectTypeRandom() {
        if (this.disabled) return;
        this.disabled = true;
        setTimeout(() => {
            this.disabled = false;
        }, 500);
        MusicFunc('Background_Music', 'stop')
        this.props.navigation.navigate('SelectRandomFrnd', { gamePlayType: this.state.gamePlayType })
    }

    _selectTypeFriend() {
        if (this.disabled) return;
        this.disabled = true;
        setTimeout(() => {
            this.disabled = false;
        }, 500);
        MusicFunc('Background_Music', 'stop')
        this.props.navigation.navigate('FriendList', { gamePlayType: this.state.gamePlayType })
    }

    render() {
        return (
            <ImageBackground source={require('../image/Invite_friend/bg.png')} style={{ flex: 1 }} >
                <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">

                    <View keyboardShouldPersistTaps='always' style={[styles.commonContainer, { alignItems: 'center', paddingTop: scaleHeight(100) }]}>
                        <View>
                            <View style={{ justifyContent: 'center', alignItems: 'center', paddingTop: scaleHeight(20) }}>
                                <Image resizeMode="stretch" source={require('../image/Reset_Password/logo.png')} />
                            </View>
                        </View>

                        <TouchableOpacity style={{ marginTop: scaleHeight(40), marginHorizontal: scaleWidth(40), justifyContent: 'center', alignItems: 'center' }} onPress={() => { this._selectTypeRandom(), MusicFunc('Button_Click_Music') }}>
                            <ImageBackground source={require('../image/select_mode/sollo.png')} style={{ width: width - scaleWidth(120), height: scaleHeight(60), justifyContent: 'center', alignItems: 'center' }} resizeMode='contain'>
                                <Text style={{ color: 'white', fontSize: normalizeFont(18), fontWeight: '800', justifyContent: 'center' }}>Random</Text>
                            </ImageBackground>
                            {/* <Image source={require('../image/select_mode/sollo.png')} style={{ position: 'relative' }} />
                            <Text style={{ color: 'white', fontSize: normalizeFont(16), fontWeight: '600', position: 'absolute', zIndex: 1, justifyContent: 'center', alignSelf: 'center', top: scaleHeight(20), alignItems: "center" }}>Random</Text> */}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => { this._selectTypeFriend(), MusicFunc('Button_Click_Music') }} style={{ marginTop: scaleHeight(15), marginHorizontal: scaleWidth(40), justifyContent: 'center', alignItems: 'center' }}>
                            <ImageBackground source={require('../image/select_mode/Duel.png')} style={{ width: width - scaleWidth(120), height: scaleHeight(60), justifyContent: 'center', alignItems: 'center' }} resizeMode='contain'>
                                <Text style={{ color: 'white', fontSize: normalizeFont(18), fontWeight: '800', justifyContent: 'center', alignSelf: 'center', alignItems: "center" }}>Play with friend</Text>
                            </ImageBackground>
                            {/* <Image source={require('../image/select_mode/Duel.png')} style={{ position: 'relative' }} />
                            <Text style={{ color: 'white', fontSize: normalizeFont(16), fontWeight: '600', position: 'absolute', zIndex: 1, justifyContent: 'center', top: scaleHeight(20) }}>Play with friend</Text> */}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </ImageBackground>
        )
    }
}
