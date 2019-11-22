import React, { } from 'react';
import { View, Text, Alert, ImageBackground, Dimensions, Platform, Image } from "react-native";
import { scaleWidth, scaleHeight, normalizeFont } from '../components/common/Responsive';
import { otherUserProfile } from '../webService/ApiStore'
import { socket } from '../webService/global'

const { width, height } = Dimensions.get('window');

const Header = props => (
    <View style={{ flex: 1, justifyContent: 'flex-start', paddingTop: scaleHeight(8) }}>
        <Text style={{ color: 'white', fontSize: normalizeFont(22) }}>{props.title}</Text>
    </View>
);

const ImageHeader = props => {
    return (
        <ImageBackground
            style={{ width, height: Platform.OS == 'ios' ? 45 : 55, position: 'absolute', top: 0, left: 0 }}
            source={require("../image/Reset_Password/header.png")}
            resizeMode="cover"
        >
            <View style={{ height: 45, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' }}>
                <Header {...props} style={{ backgroundColor: 'transparent' }} />
            </View>
        </ImageBackground>
    );
}

class loaderDual extends React.Component {

    static navigationOptions = ({ navigation }) => {
        return {
            tabBarVisible: true,
            header: props => <ImageHeader {...props} title='Please wait...' />,
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            loader: true
        }
    }

    componentDidMount() {
      console.log('loaderDual')
        this.initialize()
    }


    initialize() {
        let { params } = this.props.navigation.state
        let { navigate } = this.props.navigation
        let response = false;
        var confirmationCount = 0;
        if (params.requestType != "incoming") {
            socket.on('sendingGameRequestConfirmation', (data) => {
                if (confirmationCount == 0) {
                    confirmationCount = 1;
                    socket.removeListener('sendingGameRequestConfirmation')
                    response = true
                    otherUserProfile(data.otherUserData)
                    let dataType = { "playGameWith": 'friend', "userId": data.userId, "gamePlayType": params.data.gamePlayType, "senderId": data.sendToId, "otherUserData": data.otherUserData }
                    if (data.requestStatus == "ACCEPT") {
                        params.data.gamePlayType === 'smartsort' ?
                            navigate('QuestionSmartSortDual', { data: dataType }) :
                            navigate('QuestionTop10Dual', { data: dataType })
                    }
                    else if (params.gameMode != 'GROUP') {
                        Alert.alert('TOK', "Your friend Rejected your request", [{ text: 'OK', onPress: () => this.props.navigation.navigate('Home') }])
                    }
                }
            })
        }
        if (params.requestType == "incoming") {
            params.data.gamePlayType === 'smartsort' ?
                navigate('QuestionSmartSortDual', { data: params.data }) :
                navigate('QuestionTop10Dual', { data: params.data })
        }
        else {
            setTimeout(() => {
                if (response == true) return;
                if (response == false) {
                    if (params.gameMode != 'GROUP') Alert.alert('TOK', "Your friend Rejected your Game request", [{ text: 'OK', onPress: () => navigate('Home') },])
                }
            }, 15000);
        }
    }

    componentWillUnmount() {
        socket.removeListener('sendingGameRequestConfirmation')
    }

    render() {
        return (
            <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                <View style={{ alignItems: 'center', justifyContent: "center", flex: 1 }}>
                    {this.state.requestType === "incoming" ?
                        <Text style={{ fontSize: 24, textAlign: 'center' }}>Please wait...</Text> :
                        <Text style={{ fontSize: 24, textAlign: 'center' }}>Please wait while your friend Accept your Game Request</Text>}
                    <Image resizeMode="stretch" source={require('../image/GIF/loader_anim.gif')} style={{ height: scaleHeight(250), width: scaleWidth(250) }} />
                </View>
            </View>
        )
    }
}

export default loaderDual;