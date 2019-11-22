import React from 'react';
import { View, Text, FlatList, Dimensions } from 'react-native';
import { scaleHeight, scaleWidth } from '../components/common/Responsive';

const { width, height } = Dimensions.get('window');

export default class Graph extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            barStyle: [
                { key: '1' },
                { key: '2' },
                { key: '3' },
                { key: '4' },
                { key: '5' },
                { key: '6' },
                { key: '7' },
                { key: '8' }
            ]
        }
    }

    getActualHeight(type, height) {
        if (type == 'score') {
            if (height == 10) return (scaleHeight(250) / 5) * 2
            else return 0
        }
        else {
            return (((scaleHeight(250) / 5) * 3) / 15) * height
        }
    }

    render() {
        let { styleBar, gameType } = this.props
        let Player1 = styleBar[0].Player1
        let Player2 = styleBar[0].Player2
        // //console.log("player leena ===> " + JSON.stringify(Player1) + " game Type   " +gameType)
        // let Player1 = [
        //     { "score1": 10, "timeRemaining1": 14 },
        //     { "score1": 10, "timeRemaining1": 9 },
        //     { "score1": 10, "timeRemaining1": 4 },
        //     { "score1": 10, "timeRemaining1": 14 },
        //     { "score1": 10, "timeRemaining1": 14 },
        //     { "score1": 10, "timeRemaining1": 1 },
        //     { "score1": 10, "timeRemaining1": 10 },
        //     { "score1": 10, "timeRemaining1": 14 },
        //     { "score1": 10, "timeRemaining1": 7 },
        //     { "score1": 10, "timeRemaining1": 13 },
        // ]
        // let Player2 = [
        //     { "score2": 10, "timeRemaining2": 11 },
        //     { "score2": 10, "timeRemaining2": 5 },
        //     { "score2": 10, "timeRemaining2": 7 },
        //     { "score2": 10, "timeRemaining2": 12 },
        //     { "score2": 10, "timeRemaining2": 10 },
        //     { "score2": 10, "timeRemaining2": 4 },
        //     { "score2": 10, "timeRemaining2": 9 },
        //     { "score2": 10, "timeRemaining2": 14 },
        //     { "score2": 10, "timeRemaining2": 7 },
        //     { "score2": 10, "timeRemaining2": 13 },
        // ]

        return (
            gameType == 'friend' || gameType == "random" ?
                <View style={styles.container}>
                    <View style={{ flexDirection: 'row', }}>
                        <View style={{ width: 25, justifyContent: 'center', alignItems: 'center', height: scaleHeight(220) }}>
                            <Text style={{ fontWeight: 'bold', marginTop: 30 }}>10</Text>
                            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>9</Text>
                            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>8</Text>
                            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>7</Text>
                            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>6</Text>
                            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>5</Text>
                            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>4</Text>
                            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>3</Text>
                            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>2</Text>
                            <Text style={{ fontWeight: 'bold', }}>1</Text>
                        </View>
                        <View style={{ height: scaleHeight(220), width: width - 45, flexDirection: 'row', borderLeftWidth: 3, borderBottomWidth: 3, paddingVertical: scaleHeight(10) }}>
                            <View style={{ borderRightWidth: 1.5, alignItems: 'flex-end', width: width / 2 - 22.5 }}>
                                <FlatList
                                    data={Player1}
                                    inverted={true}
                                    renderItem={({ item, index }) =>
                                        <View style={{ flexDirection: 'row-reverse', paddingTop: scaleHeight(9.2) }}>
                                            {/* <View style={{ width: item.score1 == 10 ? ((width - 45) / 2) / 6 * 2 : 0, backgroundColor: 'skyblue', height: 10 }} /> */}
                                            <View style={{ width: item.score1 == 10 ? ((((width - 45) / 2) / 6 * 4) / 15) * item.timeRemaining1 : 0, backgroundColor: 'green', height: 10 }} />
                                        </View>
                                    }
                                />
                            </View>
                            <View style={{ borderLeftWidth: 1.5, alignItems: 'flex-start', width: width / 2 - 22.5 }}>
                                <FlatList
                                    data={Player2}
                                    inverted={true}
                                    renderItem={({ item, index }) =>
                                        <View style={{ flexDirection: 'row', paddingTop: scaleHeight(9.2) }}>
                                            {/* <View style={{ width: item.score2 == 10 ? ((width - 45) / 2) / 5 * 2 : 0, backgroundColor: 'orange', height: 10 }} /> */}
                                            <View style={{ width: item.score2 == 10 ? ((((width - 45) / 2) / 6 * 4) / 15) * item.timeRemaining2 : 0, backgroundColor: 'red', height: 10 }} />
                                        </View>
                                    }
                                />
                            </View>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', width: width - 35, marginLeft: 30 }}>
                        <View style={{ flexDirection: 'row', width: (width - 45) / 2, justifyContent: 'space-between', paddingRight: ((width - 45) / 2) / 8 }}>
                            <Text style={{ fontWeight: 'bold' }}></Text>
                            <Text style={{ fontWeight: 'bold' }}></Text>
                            <Text style={{ fontWeight: 'bold' }}></Text>
                            <Text style={{ fontWeight: 'bold' }}>10</Text>
                            <Text style={{ fontWeight: 'bold' }}>5</Text>
                        </View>
                        <Text style={{}}>0</Text>
                        <View style={{ flexDirection: 'row', width: (width - 45) / 2, justifyContent: 'space-between', paddingLeft: ((width - 45) / 2) / 8 }}>
                            <Text style={{ fontWeight: 'bold' }}>5</Text>
                            <Text style={{ fontWeight: 'bold' }}>10</Text>
                            <Text style={{ fontWeight: 'bold' }}></Text>
                            <Text style={{ fontWeight: 'bold' }}></Text>
                            <Text style={{ fontWeight: 'bold' }}></Text>
                        </View>
                    </View>
                </View>
                :
                gameType == "timed" ?
                    <View style={styles.container}>
                        <View style={{ margin: scaleWidth(20) }}>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ flexDirection: 'column', width: scaleWidth(20), justifyContent: 'space-between', paddingRight: scaleWidth(2) }}>
                                    <Text style={{ fontWeight: 'bold', textAlign: 'right' }}></Text>
                                    <Text style={{ fontWeight: 'bold', textAlign: 'right' }}></Text>
                                    <Text style={{ fontWeight: 'bold', textAlign: 'right' }}></Text>
                                    <Text style={{ fontWeight: 'bold', textAlign: 'right' }}>10</Text>
                                    <Text style={{ fontWeight: 'bold', textAlign: 'right' }}>5</Text>
                                    <Text style={{ fontWeight: 'bold', textAlign: 'right' }}>0</Text>
                                </View>
                                <View style={{ borderLeftWidth: 2.5, borderLeftColor: 'black', borderBottomWidth: 2.5, borderBottomColor: 'black', width: width - scaleWidth(60), height: scaleHeight(250) }}>
                                    <FlatList
                                        data={Player1}
                                        renderItem={({ item, index }) =>
                                            <View style={{ justifyContent: "space-between", flexDirection: "column", height: scaleHeight(250), marginLeft: index == 0 ? scaleWidth(10) : scaleWidth(18.2) }}>
                                                <View />
                                                <View>
                                                    <View style={{ backgroundColor: '#f47a41', height: item.score1 == 10 ? this.getActualHeight('time', item.timeRemaining1) : 0, width: 10 }} />
                                                    {/* <View style={{ backgroundColor: '#42aaf4', height: item.score1 == 10 ? this.getActualHeight('score', item.score1):0, width: 10 }} /> */}
                                                </View>
                                            </View>
                                        }
                                        horizontal
                                        keyExtractor={(item, index) => index.toString()}
                                    />
                                </View>
                            </View>
                            <View style={{ flexDirection: "row", width: width - scaleWidth(100), marginLeft: scaleWidth(35), marginRight: scaleWidth(50) }}>
                                <Text style={{ fontWeight: 'bold', }}>1</Text>
                                <Text style={{ fontWeight: 'bold', marginLeft: 20 }}>2</Text>
                                <Text style={{ fontWeight: 'bold', marginLeft: 20 }}>3</Text>
                                <Text style={{ fontWeight: 'bold', marginLeft: 20 }}>4</Text>
                                <Text style={{ fontWeight: 'bold', marginLeft: 20 }}>5</Text>
                                <Text style={{ fontWeight: 'bold', marginLeft: 20 }}>6</Text>
                                <Text style={{ fontWeight: 'bold', marginLeft: 20 }}>7</Text>
                                <Text style={{ fontWeight: 'bold', marginLeft: 20 }}>8</Text>
                                <Text style={{ fontWeight: 'bold', marginLeft: 20 }}>9</Text>
                                <Text style={{ fontWeight: 'bold', marginLeft: 20 }}>10</Text>
                            </View>
                        </View>
                    </View> : null
        )
    }
}

const styles = {
    container: {
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent'
    }
}

