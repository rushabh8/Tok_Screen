import React, { Component } from 'react';
import {
    Text,
    View,
    ImageBackground,
    AsyncStorage,
    TouchableOpacity,
    Image,
    FlatList,
    Platform,
    Dimensions
} from 'react-native';
import Alert from './profileModal'
import styles from '../components/styles/styles'
import { scaleWidth, scaleHeight, normalizeFont } from '../components/common/Responsive';
import webservice from '../webService/Api';
import Loader from './loader';
import topic from '../image/home/image.png'
const Viewmore = require('../image/Btn/btn.png')
const avatar = require('../image/create/default.png')
const { width, height } = Dimensions.get('window')
export default class Search extends Component {
    constructor(props) {
        super(props);
        this.state = {
            focus: "club",
            history: '',
            userId: '',
            soloGameHistory: [],
            clubGameHistory: [],
            isLoading: false
        }
    }

    switchHeader(param) {
        this.setState({
            focus: param
        })
    }

    componentDidMount() {
        AsyncStorage.getItem('userId')
            .then((resp) => {
                this.setState({ userId: JSON.parse(resp), isLoading: true }, () => this.showHistory())
            })
    }

    showHistory = () => {
        let variables = {
            "userId": this.state.userId
        }
        this.setState({ isLoading: false })
        return webservice(variables, "users/gameHistory", "POST")
            .then(resp => {
                let soloList = resp.data.data.filter(x => x.gameMode === "SOLO" ||
                    x.gameMode === "DULE" ? x.gameMode = "DUEL" : null
                )
                let clubList = resp.data.data.filter(x => x.gameMode === "GROUP")
                this.setState({ soloGameHistory: soloList, clubGameHistory: clubList, isLoading: false })
            })
    }

    render() {
        return (
            <ImageBackground source={require('../image/Invite_friend/bg.png')} style={{ flex: 1, paddingBottom: scaleHeight(30) }}>
                <View style={[styles.commonContainer, { paddingTop: scaleHeight(50) }]}>
                    <View style={{ flexDirection: "row", justifyContent: 'space-between', height: Platform.OS === 'ios' ? scaleHeight(50) : scaleHeight(60) }}>
                        <TouchableOpacity onPress={() => this.switchHeader("club")} style={{ justifyContent: 'center', alignItems: 'center', flex: 1, borderBottomWidth: 2, borderBottomColor: this.state.focus == "club" ? "red" : "grey" }}>
                            <Text style={{ color: this.state.focus == "club" ? "red" : "grey" }}>Club History</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.switchHeader("game")} style={{ justifyContent: 'center', alignItems: 'center', flex: 1, borderBottomWidth: 2, borderBottomColor: this.state.focus == "game" ? "red" : "grey" }}>
                            <Text style={{ color: this.state.focus == "game" ? "red" : "grey" }}>Game History</Text>
                        </TouchableOpacity>
                    </View>
                    <Loader visible={this.state.isLoading} />
                    {/* -------------------------------------------- History of Club ---------------------------------- */}

                    {this.state.focus == 'club' ?
                        this.state.clubGameHistory.length !== 0 ?
                            <FlatList
                                data={this.state.clubGameHistory}
                                paddingBottom={100}
                                renderItem={({ item, index }) =>
                                    <View style={{ marginHorizontal: scaleWidth(5), marginVertical: scaleHeight(5), paddingHorizontal: scaleWidth(3), paddingVertical: scaleWidth(5), borderColor: "grey", borderWidth: 1, borderRadius: 8 }}>
                                        <View style={{ flexDirection: 'row' }}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ fontSize: normalizeFont(16), marginLeft: 4 }}>{item.userData[0].name}</Text>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ fontWeight: 'bold', color: 'red', fontSize: normalizeFont(16) }}>{item.groupName}</Text>
                                            </View>
                                        </View>
                                        <View style={{ flexDirection: 'row' }}>
                                            <View style={{ flex: 0.3 }}>

                                                <Image source={(item.userData[0].avatar !== null || item.userData[0].avatar === "") ? { uri: item.userData[0].avatar } : avatar} style={{ marginLeft: scaleWidth(5), width: scaleWidth(47), height: scaleHeight(47) }} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <View style={{ flexDirection: 'row', marginTop: 5 }}>
                                                    <Text style={{ marginLeft: scaleWidth(12), fontWeight: 'bold', fontSize: normalizeFont(16) }}>Topic:</Text>
                                                    <Text style={{ marginLeft: scaleWidth(12), fontSize: normalizeFont(16) }}>{item.userData[0].subCategoryName}</Text>
                                                </View>
                                                <View style={{ flexDirection: 'row', marginTop: 5 }}>
                                                    <Text style={{ marginLeft: scaleWidth(12), fontWeight: 'bold', fontSize: normalizeFont(16) }}>Score</Text>
                                                    <Text style={{ marginLeft: scaleWidth(12), fontSize: normalizeFont(16) }}>{item.userData[0].score}</Text>
                                                </View>
                                                <View style={{ flexDirection: 'row', marginTop: 5 }}>
                                                    <Text style={{ marginLeft: scaleWidth(12), fontWeight: 'bold', fontSize: normalizeFont(16) }}>Rank</Text>
                                                    <Text style={{ marginLeft: scaleWidth(12), fontSize: normalizeFont(16) }}>1</Text>

                                                    <TouchableOpacity style={{ marginLeft: scaleWidth(60) }} onPress={() => this.props.navigation.navigate("LeaderBoardHome", { name: item.userData[0].name, avatar: item.userData[0].avatar, score: item.userData[0].score, gameRoomId: item.gameRoomId })}>
                                                        <ImageBackground source={Viewmore} style={{}} >
                                                            <Text style={{ marginVertical: scaleHeight(5), marginHorizontal: scaleWidth(5), color: 'white' }} >View More</Text>
                                                        </ImageBackground>
                                                    </TouchableOpacity>

                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                }
                                keyExtractor={(item, index) => index.toString()}
                            />
                            :
                            <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }} >
                                <Text style={{ color: 'red', fontSize: normalizeFont(20) }} >There is no club history</Text>
                            </View>
                        :
                        null
                    }

                    {/* -------------------------------------------- History of Game ---------------------------------- */}

                    {this.state.focus == 'game' ?
                        this.state.soloGameHistory.length !== 0 ?
                            <FlatList
                                data={this.state.soloGameHistory}
                                renderItem={({ item, index }) =>
                                    <View style={{ marginHorizontal: scaleWidth(5), marginVertical: scaleHeight(5), paddingHorizontal: scaleWidth(3), paddingVertical: scaleWidth(5), borderColor: "grey", borderWidth: 1, borderRadius: 8 }}>
                                        <View style={{ alignItems: 'center' }}>
                                            <Text style={{ fontWeight: 'bold', color: 'red', fontSize: normalizeFont(16), }}>{item.gameMode}</Text>
                                        </View>
                                        <View style={{ flexDirection: "row" }}>
                                            {item.userData.map((user, i) => {
                                                return (
                                                    <View key={i} style={{ flexDirection: 'row', width: width / 2 - 15, marginRight: 10 }}>
                                                        {/* <View> */}
                                                        <Image source={(user.avatar !== null || user.avatar === "") ? { uri: user.avatar } : avatar} style={{ marginLeft: scaleWidth(5), width: scaleWidth(47), height: scaleHeight(47) }} resizeMode='contain' />
                                                        {/* </View> */}
                                                        <View style={{ width: '70%' }}>
                                                            <Text numberOfLines={1} ellipsizeMode='tail' style={{ width: '100%', fontSize: normalizeFont(16) }}>{user.name}</Text>
                                                            <View style={{ flexDirection: 'row', marginTop: 5, width: '100%' }}>
                                                                <Text style={{ fontWeight: 'bold', fontSize: normalizeFont(16), width: '40%' }}>Topic:</Text>
                                                                <Text numberOfLines={1} ellipsizeMode='tail' style={{ marginLeft: scaleWidth(2.5), width: scaleWidth(60), fontSize: normalizeFont(16), paddingRight: 5 }} numberOfLines={2} ellipsizeMode='tail'>{user.subCategoryName}</Text>
                                                            </View>
                                                            <View style={{ flexDirection: 'row', marginTop: 5 }}>
                                                                <Text style={{ fontWeight: 'bold', fontSize: normalizeFont(16) }}>Score:</Text>
                                                                <Text style={{ marginLeft: scaleWidth(2.5), fontSize: normalizeFont(16) }}>{user.score}</Text>
                                                            </View>
                                                        </View>
                                                    </View>
                                                )
                                            })}
                                        </View>
                                    </View>
                                }
                                keyExtractor={(item, index) => index.toString()}
                            />
                            :
                            <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }} >
                                <Text style={{ color: 'red', fontSize: normalizeFont(20) }} >There is no game history</Text>
                            </View>
                        :
                        null}
                </View>
            </ImageBackground>


        )
    }
}

