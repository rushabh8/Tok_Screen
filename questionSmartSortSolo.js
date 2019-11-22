import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    ImageBackground,
    Dimensions,
    Easing,
    Animated,
    Platform,
    AsyncStorage,
    FlatList,
    BackHandler,
    ToastAndroid
} from 'react-native';
import * as Animatable from 'react-native-animatable'
import { scaleWidth, scaleHeight, normalizeFont } from '../components/common/Responsive';
import { MusicFunc } from '../components/common/SoundFunc';
import AnswerModal from './answerModal';
import QuitModal from './quitModal';
import webservice from '../webService/Api';
import Loader from './loader';

const { width, height } = Dimensions.get('window');
const back = require('../image/BackIcon/back-icon.png')
const profileImage = require('../image/user.png')

const greyDot = require('../image/question/greyDot.png')
const redDot = require('../image/question/redDot.png');
const greenDot = require('../image/question/greenDot.png');
const red = require('../image/Smartshot/red.png')
const green = require('../image/Smartshot/green.png')
const GIF = require('../image/Smartshot/GIF.gif')
const blue = require('../image/Smartshot/blue.png')
const Question = require('../image/Gameplay_Screen/QuestionRow.png')

let correctAnswer;

export default class QuestionSmartSortSolo extends Component {
    constructor() {
        super()
        this.state = {
            onCheckedAnswer: false,
            subCategoryId: null,
            questionArray: [],
            modalVisible: false,
            quitModal: false,
            selectedLanguage: '',
            gameType: '',
            index: 0,
            right: false,
            wrong: false,
            rightCount: 0,
            wrongCount: 0,
            score1: 0,
            timeRemaining: 15,
            userId: "",
            name: "",
            country: "",
            state: "",
            win: "",
            lose: "",
            image: '',
            Avatar: null,
            isLoading: false,
            gameRoomId: "",
            show: false, show1: false, show2: false,
            ABCButton: [],
            gamePlayType: '',
            ABCImage: GIF,
            oneTimeClick: true,
            graphArray: [{
                "Player1": []
            }],
            count: 0,
            drop: []
        }
        this.animatedValue1 = new Animated.Value(0)
        this.animatedValue2 = new Animated.Value(0)
        this.animatedValue3 = new Animated.Value(0)
        this.animatedValue4 = new Animated.Value(0)
        this.animatedValue5 = new Animated.Value(0)
        this.animatedValue6 = new Animated.Value(0)
    }


    componentDidMount() {
        this.setState({ isLoading: true })
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

        //  ******************** get gameType ********************

        let type = this.props.navigation.state.params.type
        if (type.playGameWith === "friend" || type === "friend") this.setState({ gameType: "timed", playGameWith: "friend" })
        else this.setState({ gameType: type })
        this.animate()

        //  ******************** get userId ********************

        AsyncStorage.getItem('userId').then((id) => {
            this.setState({ userId: JSON.parse(id) })
        })
        setTimeout(() => { this.viewProfile() }, 500)

        //  ******************** get gameRoomId ********************

        AsyncStorage.getItem('gameRoomId').then((res) => {
            this.setState({ gameRoomId: JSON.parse(res) })
        })

        //  ******************** get subCategoryId ********************

        AsyncStorage.getItem('subCategoryId').then((id) => {
            this.setState({ subCategoryId: id })
        })

        setTimeout(() => {
            MusicFunc('Question_Appear_Music');
            this.setUserStatus()
            this.getQuestions(this.state.subCategoryId)
        }, 1000)

        setTimeout(() => {
            MusicFunc('Option_Appear_Music');
        }, 2000);

        //  ******************** get language ********************

        AsyncStorage.getItem('language').then((lang) => {
            if (lang == null) {
                this.setState({ selectedLanguage: 'English' })
            }
            else {
                this.setState({ selectedLanguage: lang })
            }
        })

        //  ******************** start the timer ********************

        this.timer()
    }

    // ********************* handle Back Button **********************
    handleBackButton = () => {
        // ToastAndroid.show('You can not go back from this page using back button', ToastAndroid.SHORT);
        this.setState({ quitModal: true })
        return true;
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    }


    viewProfile = () => {
        let variables = {
            "userId": this.state.userId
        }
        return webservice(variables, "users/viewProfile", "POST")
            .then(resp => {
                if (resp.data.responseCode === 200) {
                    this.setState({
                        name: resp.data.data[0].name,
                        image: resp.data.data[0].avatar,
                        isLoading: false
                    })
                } else {
                    this.setState({ isLoading: false })
                    alert(resp.data.responseMessage)
                }
            })
    }

    timer() {
        setTimeout(() => {
            if (this.state.gameType == "timed") {
                setTimeout(() => {
                    MusicFunc('Clock_Tik_Music', 'play')
                }, 1000);
                if (this.state.timeRemaining !== 0) this.interval = setInterval(() => { this.tick() }, 1000)
            }
        }, 3500)
    }

    // ******************** timer function ********************

    tick() {
        let { questionArray } = this.state;
        if (this.state.timeRemaining === 0) {
            let checkAns = this.state.questionArray[this.state.index]
            let { ABCButton } = this.state
            ABCButton = ["abc", "acb", "bca", "bac", "cba", "cab"]
            var randomElement = Math.floor(Math.random() * ABCButton.length);
            randomElement = randomElement.toString()
            let answer = ABCButton[randomElement]
            if (this.state.onCheckedAnswer == false) {
                if (correctAnswer === answer) {
                    checkAns.value = 'green'
                    MusicFunc('Right_Answer_Music')
                    this.setState({ ABCImage: green, questionArray, ABCButton: answer, show: true, show1: true, show2: true, right: true })
                    this.updateScore(answer)
                }
                else {
                    checkAns.value = 'red'
                    this.setState({ ABCImage: red, questionArray, wrong: true, ABCButton: answer, show: true, show1: true, show2: true })
                    this.updateScore(answer)
                    MusicFunc('Wrong_Answer_Music')
                    setTimeout(() => {
                        this.setState({ ABCImage: green, ABCButton: correctAnswer })
                    }, 500)
                }
            }
            let selectAns = questionArray[this.state.index]
            selectAns.selectAnswer = answer;
            clearInterval(this.interval)
            setTimeout(() => {
                clearInterval(this.interval)
                this.nextQuestion()
            }, 1000)
            return;
        }
        else {
            !this.state.onCheckedAnswer ? this.setState({ timeRemaining: this.state.timeRemaining - 1 }) : null
            if (this.state.modalVisible == true) {
                var remainingTime = this.state.timeRemaining;
                this.setState({ remainingTime: remainingTime })
            }
        }
    }


    // ******************** animation functions ********************
    animate() {
        this.animatedValue1.setValue(0)
        this.animatedValue2.setValue(0)
        this.animatedValue3.setValue(0)
        this.animatedValue4.setValue(0)
        this.animatedValue5.setValue(0)
        this.animatedValue6.setValue(0)
        const createAnimation = function (value, duration, easing, delay = 0) {
            return Animated.timing(
                value,
                {
                    toValue: 1,
                    duration,
                    easing,
                    delay
                }
            )
        }
        Animated.parallel([
            createAnimation(this.animatedValue1, 2000, Easing.ease),
            createAnimation(this.animatedValue2, 1500, Easing.ease),
            createAnimation(this.animatedValue3, 1600, Easing.ease, 1600),
            createAnimation(this.animatedValue4, 1600, Easing.ease, 1600),
            createAnimation(this.animatedValue5, 2000, Easing.ease, 2000),
            createAnimation(this.animatedValue6, 2000, Easing.ease, 3000),
        ]).start()
    }

    fadeOutLeft = (answer) => this.clock.fadeOutLeft(1000).then(endState => endState.finished ? this.zoomIn(answer) : null)
    zoomIn = (answer) => {
        this.setState({ bonus: this.state.timeRemaining },
            () => this.plus.zoomIn(500).then(endState => endState.finished ? this.plus.fadeOutLeft(1000).then(endState => endState.finished ? this.updateScore(answer) : null) : null)
        )
    }
    bounce = () => this.score.shake(500).then(endState => endState.finished ? setTimeout(() => {
        this.nextQuestion()
    }, 1000) : null);

    reset() {
        this.clock.pulse()
        this.plus.pulse()
        this.score.pulse()
    }

    // ************************* set user status false ****************************

    setUserStatus() {
        let variables = {
            "_id": this.state.userId,
            "status": "BUSY"
        }
        return webservice(variables, "users/onlineFalse", "POST")
            .then((resp) => { })
    }

    // ******************** get the questions using subCategoryId ********************
    getQuestions() {
        this.setState({ isLoading: true })
        let variables = {
            "gameRoomId": this.state.gameRoomId
        }
        return webservice(variables, "topten/getSmartQuestionByRoomID", "POST")
            .then(resp => {
                if (resp.data.responseCode === 200) {
                    for (let i in resp.data.data) {
                        resp.data.data[i]["selectAnswer"] = ""
                    }
                    this.setState({ questionArray: resp.data.data, isLoading: false })
                }
                else if (resp.data.responseCode === 400) {
                    this.setState({ isLoading: false })
                    alert("400--" + resp.data.responseMessage)
                }
                else {
                    alert('error')
                }
            })
    }

    // ******************** check the selected Option ********************

    onCheckedOption(option) {
        if (option === 'a') {
            this.setState({
                show: !this.state.show
            })
        }
        else if (option === 'b') {
            this.setState({
                show1: !this.state.show1
            })
        }
        else if (option === 'c') {
            this.setState({
                show2: !this.state.show2
            })
        }
        let { ABCButton } = this.state
        if (ABCButton.length == 0) {
            ABCButton.push(option)
        } else {
            if (ABCButton[1] != option && ABCButton.length < 3) {
                ABCButton.push(option)
            }
        }
        this.setState({ ABCButton })
    }

    // ******************** check the selected Answer ********************
    onCheckedAnswer() {
        MusicFunc('Clock_Tik_Music', "stop")
        if (this.state.oneTimeClick) {
            let { questionArray } = this.state;
            let checkAns = this.state.questionArray[this.state.index]
            let correctAnswer = this.state.questionArray[this.state.index].correctAnswer
            let { ABCButton } = this.state
            let answer = ABCButton.join("")
            if (ABCButton.length < 3) {
                alert('Please select all fields.')
            } else {
                this.setState({ oneTimeClick: false })
                if (correctAnswer === answer) {
                    checkAns.value = 'green'
                    MusicFunc('Right_Answer_Music')
                    this.setState({ right: true, questionArray, ABCImage: green })
                    // this.updateScore(answer)
                    this.state.gameType === 'timed' ? this.fadeOutLeft(answer) : this.updateScore(answer)
                }
                else {
                    checkAns.value = 'red'
                    this.setState({ wrong: true, questionArray, ABCImage: red })
                    this.updateScore(answer)
                    MusicFunc('Wrong_Answer_Music')
                    setTimeout(() => {
                        this.setState({ ABCImage: green, ABCButton: correctAnswer })
                    }, 1000)
                    setTimeout(() => {
                        if (this.state.gameType === 'timed') this.nextQuestion()
                    }, 3000)
                }
                clearInterval(this.interval)
                // setTimeout(() => {
                //     if (this.state.gameType === 'timed') this.nextQuestion()
                // }, 3000)
                let selectAns = questionArray[this.state.index]
                let quesId = questionArray[this.state.index].question_Id
                let selectAnsEnglish = questionArray[this.state.index].english
                let selectHindi = questionArray[this.state.index].hindi
                selectAns.selectAnswer = answer;
                this.setState({ questionArray })
                setTimeout(() => {
                    if (this.state.gameType === 'practice' && (selectAnsEnglish.explanation != '' || selectHindi.explanation != ''))
                        this.setState({ modalVisible: true })
                    else this.setState({ modalVisible: false })
                }, 3000);
            }
        }
    }
    updateScore(answer) {
        if (this.state.timeRemaining != 0) {
            if (answer == correctAnswer) {
                this.state.gameType == "practice" ?
                    setTimeout(() => {
                        this.setState({
                            score1: this.state.score1 + 10,
                            rightCount: this.state.rightCount + 1,
                        })
                    }, 300) :
                    this.state.gameType == "timed" ?
                        setTimeout(() => {
                            this.setState({
                                score1: this.state.score1 + 10 + this.state.timeRemaining,
                                rightCount: this.state.rightCount + 1
                            }, () => this.bounce())
                        }, 300) : null
            }
            else {
                this.setState({ wrongCount: this.state.wrongCount + 1 })
            }
            let graphData = {};
            graphData =
                {
                    'score1': answer === correctAnswer ? 10 : 0,
                    'timeRemaining1': this.state.timeRemaining
                }
            this.state.graphArray[0].Player1.push(graphData)
        }
    }
    answerModalClose() {
        this.setState({ modalVisible: false })
    }

    nextQuestion() {
        this.setState({
            ABCImage: GIF,
            modalVisible: false,
            timeRemaining: 15,
            show: false, show1: false,
            show2: false,
            ABCButton: [],
            right: false,
            wrong: false,
            oneTimeClick: true
        })
        let { index, questionArray } = this.state
        index++;
        if (index <= questionArray.length - 1) {
            this.setState({ index })
            this.timer();
            setTimeout(() => {
                MusicFunc('Question_Appear_Music')
            }, 1000);
            setTimeout(() => {
                MusicFunc('Option_Appear_Music');
            }, 2000);
        }
        else {
            this.setState({ isLoading: true })
            clearInterval(this.interval)
            setTimeout(() => {
                this._saveGameHistory();
            }, 500)
        }
        this.animate()
    }

    _saveGameHistory() {
        let gameObj = {
            score1: this.state.score1,
            myQuestions: this.state.questionArray,
            id: this.state.subCategoryId,
            right: this.state.rightCount,
            wrong: this.state.wrongCount,
            selectedLanguage: this.state.selectedLanguage,
            gameType: this.state.gameType,
            gamePlayType: this.state.gamePlayType,
            graphArray: this.state.graphArray,
        }
        let variables = {
            "userId": this.state.userId,
            "gameRoomId": this.state.gameRoomId,
            "totalScore": this.state.score1,
            "win": "true",
            "lose": "false"
        }
        return webservice(variables, "topTen/saveGameHistory", "POST")
            .then(resp => {
                this.setState({ isLoading: false })
                if (resp.data.responseCode === 200) {
                    clearInterval(this.interval)
                    this.setState({ index: 0, timeRemaining: 15 })
                    if (this.state.playGameWith === "friend")
                        this.props.navigation.navigate("LeaderBoard", { gameRoomId: this.state.gameRoomId })
                    else
                        this.props.navigation.navigate("GameCompleteSmartSort", { gameObj: gameObj })
                } else if (resp.data.responseCode === 1000) {
                    setTimeout(() => { alert(resp.data.responseMessage) }, 1000)
                }
            })
    }

    onDeleteOption() {
        this.setState({
            show: false, show1: false, show2: false, ABCButton: []
        })
    }

    // changes 
    dropPoints = (score) => {
        let drop = this.state.drop;
        drop.push(score)
    }
    animationComplete = (countNum) => {
        drop = this.state.drop;
        drop.splice(drop.indexOf(countNum), 1)
        this.setState({ drop })
    }
    renderPoints() {
        return this.state.drop.map(countNum => <AddPoints key={countNum} count={countNum} animationComplete={this.animationComplete.bind(this)} />)
    }

    resize() {
        let { index, questionArray, selectedLanguage } = this.state
        let lang = selectedLanguage.toLowerCase()
        let Options = { ...questionArray[index][lang] }
        delete Options['question']
        if (Options) {
            for (let item in Options) {
                item.length > 25 ? true : false
            }
        }
        // let { index, questionArray } = this.state
        // if (questionArray[index].english.a.length > 25 || questionArray[index].english.b.length > 25 || questionArray[index].english.c.length > 25 || questionArray[index].english.d.length > 25 || questionArray[index].hindi.a.length > 25 || questionArray[index].hindi.b.length > 25 || questionArray[index].hindi.c.length > 25 || questionArray[index].hindi.d.length > 25) {
        //     return 'yes'
        // } else {
        //     return 'no'
        // }
    }

    resizeQues() {
        let { index, questionArray } = this.state
        if (questionArray[index].english.question.length > 180 || questionArray[index].hindi.b.length > 180) {
            return 'yes'
        } else {
            return 'no'
        }
    }

    render() {
        const introButton = this.animatedValue1.interpolate({
            inputRange: [0, 1],
            outputRange: [-500, 10]
        })
        const introButton1 = this.animatedValue2.interpolate({
            inputRange: [0, 1],
            outputRange: [-500, 1]
        })
        const centerImage = this.animatedValue3.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [1, 0, 1]
        })
        const introButton2 = this.animatedValue4.interpolate({
            inputRange: [0, 1],
            outputRange: [-500, 1]
        })
        const introButton3 = this.animatedValue5.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [-500, 350, 100]
        })
        const introButton4 = this.animatedValue6.interpolate({
            inputRange: [0, 1],
            outputRange: [500, 0]
        })

        let { ABCImage, questionArray, index, selectedLanguage, show, show1, show2, score1, ABCButton, right, wrong } = this.state
        if (this.state.questionArray.length > 0) {
            if (selectedLanguage == 'English') {
                questionList = questionArray[index].english
                correctAnswer = questionArray[index].correctAnswer
            }
            else if ((selectedLanguage == 'Hindi')) {
                questionList = questionArray[index].hindi
                correctAnswer = questionArray[index].correctAnswer
            }
        }

        return (
            this.state.questionArray.length > 0 ?
                <ImageBackground source={require('../image/Gameplay_Screen/bg.png')} style={{ flex: 1 }} resizeMode='stretch' >
                    <Loader visible={this.state.isLoading} />
                    <TouchableOpacity style={{ flexDirection: 'row', top: scaleHeight(8) }} onPress={() => this.setState({ quitModal: true })}>
                        <Image source={back} style={{ width: scaleWidth(25), height: scaleHeight(25) }} />
                        <Text style={{ fontSize: normalizeFont(18) }}>{this.state.name}</Text>
                    </TouchableOpacity>
                    <QuitModal
                        visible={this.state.quitModal}
                        message="Are you sure you want to quit game?"
                        No={() => this.setState({ quitModal: false })}
                        Yes={() => {
                            this.setState({ quitModal: false })
                            this.props.navigation.navigate("Home")
                            clearInterval(this.interval)
                        }}
                    />
                    {/* <View style={styles.termsContainer}>
                        <View style={{ flexDirection: 'row', paddingTop: scaleHeight(5) }}>
                            <View
                                style={{ shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.5, shadowRadius: 1, }}>
                                <Image source={this.state.image ? { uri: this.state.image } : profileImage} style={{
                                    width: scaleWidth(80), height: scaleHeight(80), borderRadius: 10, borderColor: 'white', borderWidth: 5,
                                }} />
                            </View>
                            <ImageBackground source={require('../image/Gameplay/Bluescroce.png')} style={{ alignSelf: 'center', left: scaleWidth(5) }} >
                                <Text style={{ color: 'white', padding: 7, }}>{score1}</Text>
                            </ImageBackground>
                        </View>
                        {this.state.gameType == "timed" ?
                            <ImageBackground source={require('../image/Gameplay/score.png')} style={{ height: 30, width: 40, alignSelf: 'center', justifyContent: 'center', alignItems: 'center', transform: [{ rotate: '180deg' }] }}>
                            </ImageBackground> : null}
                        {this.state.gameType == "timed" ?
                            <ImageBackground source={require('../image/Gameplay/clock.png')} style={{ height: scaleHeight(50), width: scaleWidth(40), alignSelf: 'center', justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ fontSize: normalizeFont(18), color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>{this.state.timeRemaining}</Text>
                            </ImageBackground> : null}
                    </View> */}

                    <View style={styles.termsContainer}>
                        <View style={{ flexDirection: 'row', paddingTop: scaleHeight(5) }}>
                            <View
                                style={{ shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.5, shadowRadius: 1, }}>
                                <Image source={this.state.image ? { uri: this.state.image } : profileImage} style={{
                                    width: scaleWidth(80), height: scaleHeight(80), borderRadius: 10, borderColor: 'white', borderWidth: 5,
                                }} resizeMode='contain' />
                            </View>
                            <Animatable.View ref={ref => this.score = ref} iterationCount={1} style={{ alignItems: 'center', justifyContent: 'center' }}>
                                <ImageBackground source={require('../image/Gameplay/Bluescroce.png')} style={{ alignSelf: 'center', justifyContent: 'center', alignItems: 'center', width: scaleWidth(40), paddingVertical: scaleHeight(7.5), paddingHorizontal: scaleWidth(5), marginLeft: scaleWidth(3) }} resizeMode='contain'>
                                    <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: normalizeFont(16), padding: 3 }}>{score1}</Text>
                                </ImageBackground>
                            </Animatable.View>
                        </View>

                        {this.state.gameType == "timed" ?
                            <Animatable.View ref={ref => this.plus = ref} style={{ right: scaleWidth(15), alignItems: 'center', justifyContent: 'center' }}>
                                <ImageBackground source={require('../image/Gameplay/score.png')} style={{ height: scaleHeight(40), width: scaleWidth(50), justifyContent: 'flex-end', transform: [{ rotate: '180deg' }] }} resizeMode='contain'>
                                    <View style={{ width: '70%', height: '100%', backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ fontSize: normalizeFont(20), color: '#fff', fontWeight: 'bold', textAlign: 'center', transform: [{ rotate: '180deg' }] }}>{this.state.bonus}</Text>
                                    </View>
                                </ImageBackground>
                            </Animatable.View>
                            : null}
                        {this.state.gameType == "timed" ?
                            <Animatable.View ref={ref => this.clock = ref} iterationCount={1} style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <ImageBackground source={require('../image/Gameplay/clock.png')} style={{ height: scaleHeight(75), width: scaleWidth(65), alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginRight: scaleWidth(5) }} resizeMode='stretch'>
                                    <Text style={{ justifyContent: 'center', alignItems: 'center', fontSize: normalizeFont(22), top: scaleHeight(2), color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>{this.state.timeRemaining}</Text>
                                </ImageBackground>
                            </Animatable.View>
                            : null}
                    </View>


                    {/* <View style={{ flexDirection: 'row' }}>
                        <View style={{ height: 25, width: score1 + "%", backgroundColor: "#0055d1" }}></View>
                        <View style={{ height: 35, width: 15, backgroundColor: "#00bbe8", marginTop: -5, borderRadius: 1, borderWidth: 1, borderColor: "grey" }}></View>
                        <View style={{ height: 25, width: "100%", backgroundColor: "#ff642b" }}></View>
                    </View> */}





                    <Image source={require('../image/Gameplay/line.png')} style={{ width }} />
                    <View style={{ flexDirection: 'row', alignItems: 'center', width }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 3, marginLeft: scaleWidth(7.5), marginRight: scaleWidth(40) }}>
                            {/* <Image source={questionArray[0].value == 'green' ? greenDot : questionArray[0].value == 'red' ? redDot : greyDot} resizeMode="stretch" /> */}
                            <Image source={questionArray[0].value == 'green' ? greenDot : questionArray[0].value == 'red' ? redDot : greyDot} resizeMode='stretch' style={{ left: 1, marginHorizontal: scaleWidth(25) }} />
                            <Image source={questionArray[1].value == 'green' ? greenDot : questionArray[1].value == 'red' ? redDot : greyDot} resizeMode='stretch' style={{ marginRight: scaleWidth(25) }} />
                            <Image source={questionArray[2].value == 'green' ? greenDot : questionArray[2].value == 'red' ? redDot : greyDot} resizeMode='stretch' style={{ marginRight: scaleWidth(25) }} />
                        </View>
                        <View style={{ justifyContent: 'center' }} >
                            <ImageBackground source={require('../image/Gameplay/Questtion.png')} style={{ alignItems: 'center', paddingHorizontal: scaleWidth(7.5), paddingVertical: scaleHeight(5) }} resizeMode='stretch' >
                                <Text style={{ color: 'white', fontWeight: '600', fontSize: normalizeFont(17) }}>Q. {index + 1}</Text>
                            </ImageBackground>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 3, marginRight: scaleWidth(7.5), marginLeft: scaleWidth(40) }} />
                    </View>
                    <View style={{ height: height / 3 * 1.9, flexDirection: 'column', justifyContent: 'space-between', paddingTop: 10 }}>
                        <Animated.Text style={{ backgroundColor: 'transparent', width: width - scaleWidth(20), flexWrap: 'wrap', left: introButton }}>
                            <Text style={[styles.terms, { fontSize: this.resizeQues() == 'yes' ? normalizeFont(16) : normalizeFont(20), alignSelf: "center" }]}>
                                {questionList.question}
                            </Text>
                        </Animated.Text>

                        {/* ///////////////////////////////////// 1st button //////////////////////////////////////////*/}
                        {show ?
                            <View style={{ backgroundColor: 'transparent', height: Platform.OS == 'ios' ? scaleHeight(55) : scaleHeight(55), marginTop: scaleHeight(10) }} >
                                <Image source={require('../image/Smartshot/dots.png')}
                                    style={{ width: '100%' }} resizeMode='stretch' />
                                <View source={wrong ? Question : blue} style={{ width: '100%', height: scaleHeight(45), backgroundColor: '#03B1CF' }} >
                                    <Image source={require('../image/Smartshot/purple.png')}
                                        style={{ width: '100%', height: 48, bottom: 4, marginLeft: '-85%' }} resizeMode='stretch' />
                                    <Text style={{
                                        color: 'white', fontWeight: '800', fontSize: normalizeFont(19),
                                        zIndex: 1, position: 'absolute', top: 7, left: 15
                                    }}>A</Text>
                                    <Text numberOfLines={1} style={{
                                        zIndex: 1, position: 'absolute', top: scaleHeight(10), color: 'white',
                                        fontWeight: '800', fontSize: normalizeFont(19), alignSelf: 'center'
                                    }}>{questionList.a}</Text>
                                </View>
                                <Image source={require('../image/Smartshot/dots.png')} style={{ width: '100%' }} resizeMode='stretch' />
                            </View>
                            :
                            <TouchableOpacity onPress={() => this.onCheckedOption("a")} style={{ backgroundColor: 'transparent', height: Platform.OS == 'ios' ? scaleHeight(55) : scaleHeight(55), marginTop: scaleHeight(10) }}>
                                <Animated.View style={{ left: introButton2, position: 'relative' }}>
                                    <Animated.Image source={require('../image/Smartshot/dots.png')} style={{ top: 5, position: 'relative', zIndex: 1, left: introButton1, width: '100%' }} resizeMode='stretch' />
                                    <Animated.View style={{ width: width + 50, height: scaleHeight(55), backgroundColor: '#BC1D7A', transform: [{ scale: centerImage }], position: 'relative' }} />
                                    <Animated.Image source={require('../image/Smartshot/dots.png')} style={{ bottom: Platform.OS === 'ios' ? 3 : 5, position: 'relative', zIndex: 1, left: introButton1, width: '100%' }} resizeMode='stretch' />
                                </Animated.View>
                                <Animated.View style={{ left: introButton3, transform: [{ translateX: -(width + 40) }], position: 'relative', zIndex: 2, bottom: Platform.OS == 'ios' ? 54 : 54 }}>
                                    <Image source={require('../image/Smartshot/purple.png')} style={{ width: '100%', height: 48, bottom: 4 }} resizeMode='stretch' />
                                    <Text style={{ color: 'white', fontWeight: '800', fontSize: normalizeFont(19), zIndex: 1, position: 'absolute', top: 7, right: 35 }}>A</Text>
                                </Animated.View>
                                <Animated.Text style={{ left: introButton4, color: 'white', marginLeft: scaleWidth(15), fontWeight: '800', fontSize: normalizeFont(19), marginTop: scaleHeight(5), bottom: Platform.OS == 'ios' ? 95 : 95, textAlign: 'center', alignSelf: 'center' }}>{questionList.a}</Animated.Text>
                            </TouchableOpacity>
                        }
                        {/* ///////////////////////////////////// 2nd button //////////////////////////////////////////*/}
                        {show1 ?
                            <View style={{ backgroundColor: 'transparent', height: Platform.OS == 'ios' ? scaleHeight(55) : scaleHeight(55), marginTop: scaleHeight(10) }} >
                                <Image source={require('../image/Smartshot/dots.png')}
                                    style={{ width: '100%' }} resizeMode='stretch' />
                                <View source={wrong ? Question : blue} style={{ width: '100%', height: scaleHeight(45), backgroundColor: '#03B1CF' }} >
                                    <Image source={require('../image/Smartshot/purple.png')}
                                        style={{ width: '100%', height: 48, bottom: 4, marginLeft: '-85%' }} resizeMode='stretch' />
                                    <Text style={{ color: 'white', fontWeight: '800', fontSize: normalizeFont(19), zIndex: 1, position: 'absolute', top: 7, left: 15 }}>B</Text>
                                    <Text numberOfLines={1} style={{
                                        zIndex: 1, position: 'absolute', top: 7, color: 'white',
                                        textAlign: 'center',
                                        alignSelf: 'center',
                                        fontWeight: '800', fontSize: normalizeFont(19),
                                    }}>{questionList.b}</Text>
                                </View>
                                <Image source={require('../image/Smartshot/dots.png')}
                                    style={{ width: '100%' }} resizeMode='stretch' />
                            </View>
                            :
                            <TouchableOpacity onPress={() => this.onCheckedOption("b")} style={{ backgroundColor: 'transparent', height: Platform.OS == 'ios' ? scaleHeight(55) : scaleHeight(55), marginTop: scaleHeight(10) }}>
                                <Animated.View style={{ left: introButton2, position: 'relative' }}>
                                    <Animated.Image source={require('../image/Smartshot/dots.png')}
                                        style={{ top: 5, position: 'relative', zIndex: 1, left: introButton1, width: '100%' }} resizeMode='stretch' />
                                    <Animated.View
                                        style={{ width: width + 50, height: scaleHeight(55), backgroundColor: '#BC1D7A', transform: [{ scale: centerImage }], position: 'relative' }} />
                                    <Animated.Image source={require('../image/Smartshot/dots.png')}
                                        style={{
                                            bottom: Platform.OS === 'ios' ? 3 : 5, position: 'relative', zIndex: 1,
                                            left: introButton1, width: '100%'
                                        }} resizeMode='stretch' />
                                </Animated.View>
                                <Animated.View style={{
                                    left: introButton3,
                                    transform: [{ translateX: -(width + 40) },],
                                    position: 'relative', zIndex: 2,
                                    bottom: Platform.OS == 'ios' ? 54 : 54
                                }}>
                                    <Image source={require('../image/Smartshot/purple.png')}
                                        style={{ width: '100%', height: 48, bottom: 4 }} resizeMode='stretch' />
                                    <Text style={{
                                        color: 'white', fontWeight: '800', fontSize: normalizeFont(19),
                                        zIndex: 1, position: 'absolute', top: 7, right: 35
                                    }}>B</Text>
                                </Animated.View>
                                <Animated.Text
                                    style={{
                                        left: introButton4, color: 'white', marginLeft: scaleWidth(15),
                                        fontWeight: '800', fontSize: normalizeFont(19), marginTop: scaleHeight(5),
                                        bottom: Platform.OS == 'ios' ? 95 : 95, textAlign: 'center',
                                        alignSelf: 'center'
                                    }}>{questionList.b}</Animated.Text>
                            </TouchableOpacity>
                        }
                        {/* ///////////////////////////////////// 3rd button //////////////////////////////////////////*/}
                        {show2 ?
                            <View style={{ backgroundColor: 'transparent', height: Platform.OS == 'ios' ? scaleHeight(55) : scaleHeight(55), marginTop: scaleHeight(10) }} >
                                <Image source={require('../image/Smartshot/dots.png')}
                                    style={{ width: '100%' }} resizeMode='stretch' />
                                <View source={wrong ? Question : blue} style={{ width: '100%', height: scaleHeight(45), backgroundColor: '#03B1CF' }} >
                                    <Image source={require('../image/Smartshot/purple.png')}
                                        style={{ width: '100%', height: 48, bottom: 4, marginLeft: '-85%' }} resizeMode='stretch' />
                                    <Text style={{
                                        color: 'white', fontWeight: '800', fontSize: normalizeFont(19),
                                        zIndex: 1, position: 'absolute', top: 7, left: 15
                                    }}>C</Text>
                                    <Text numberOfLines={1} style={{
                                        zIndex: 1, position: 'absolute', top: 7, color: 'white',
                                        fontWeight: '800', fontSize: normalizeFont(19), textAlign: 'center',
                                        alignSelf: 'center'
                                    }}>{questionList.c}</Text>
                                </View>
                                <Image source={require('../image/Smartshot/dots.png')}
                                    style={{ width: '100%' }} resizeMode='stretch' />
                            </View>
                            :
                            <TouchableOpacity onPress={() => this.onCheckedOption("c")} style={{ backgroundColor: 'transparent', height: Platform.OS == 'ios' ? scaleHeight(55) : scaleHeight(55), marginTop: scaleHeight(10) }}>
                                <Animated.View style={{ left: introButton2, position: 'relative' }}>
                                    <Animated.Image source={require('../image/Smartshot/dots.png')}
                                        style={{ top: 5, position: 'relative', zIndex: 1, left: introButton1, width: '100%' }} resizeMode='stretch' />
                                    <Animated.View
                                        style={{ width: width + 50, height: scaleHeight(55), backgroundColor: '#BC1D7A', transform: [{ scale: centerImage }], position: 'relative' }} />
                                    <Animated.Image source={require('../image/Smartshot/dots.png')}
                                        style={{
                                            bottom: Platform.OS === 'ios' ? 3 : 5, position: 'relative', zIndex: 1,
                                            left: introButton1, width: '100%'
                                        }} resizeMode='stretch' />
                                </Animated.View>
                                <Animated.View style={{
                                    left: introButton3,
                                    transform: [{ translateX: -(width + 40) },],
                                    position: 'relative', zIndex: 2,
                                    bottom: Platform.OS == 'ios' ? 54 : 54
                                }}>
                                    <Image source={require('../image/Smartshot/purple.png')}
                                        style={{ width: '100%', height: 48, }} resizeMode='stretch' />
                                    <Text style={{
                                        color: 'white', fontWeight: '800', fontSize: normalizeFont(19),
                                        zIndex: 1, position: 'absolute', top: 7, right: 35
                                    }}>C</Text>
                                </Animated.View>
                                <Animated.Text
                                    style={{
                                        left: introButton4, color: 'white', marginLeft: scaleWidth(15),
                                        fontWeight: '800', fontSize: normalizeFont(19), marginTop: scaleHeight(5),
                                        bottom: Platform.OS == 'ios' ? 95 : 95, textAlign: 'center',
                                        alignSelf: 'center'
                                    }}>{questionList.c}</Animated.Text>
                            </TouchableOpacity>
                        }
                        {/* ///////////////////////////////////// A, B, C button //////////////////////////////////////////*/}
                        <View style={{ backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center', height: scaleHeight(55) }}>

                            <FlatList
                                horizontal
                                data={this.state.ABCButton}
                                extraData={this.state}
                                renderItem={({ item }) =>
                                    <View style={{ justifyContent: 'space-between', alignItems: 'center', right: scaleWidth(10) }}>
                                        <Image source={ABCImage} resizeMode='center' style={{ height: scaleHeight(50), width: scaleWidth(60) }} />
                                        <Text style={{ color: 'white', fontWeight: '800', fontSize: normalizeFont(19), zIndex: 1, position: 'absolute', alignSelf: 'center', top: scaleHeight(10) }}>{item.toUpperCase()}</Text>
                                    </View>
                                }
                            />
                        </View>
                        {/* /////////////////////////////////// submit and delete button ////////////////////////////////// */}
                        <View style={{ backgroundColor: 'transparent', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 50, marginTop: Platform.OS == 'ios' ? -10 : -10 }}>
                            <TouchableOpacity style={{ marginHorizontal: 15 }} onPress={() => this.onCheckedAnswer()}>
                                <Image source={require('../image/Gameplay_Screen/Submit.png')} style={{}} resizeMode='stretch' />
                            </TouchableOpacity>

                            <TouchableOpacity style={{ marginHorizontal: 15 }} onPress={() => this.onDeleteOption()}>
                                <Image source={require('../image/Gameplay_Screen/DELETE.png')} style={{}} resizeMode='stretch' />
                            </TouchableOpacity>

                        </View>
                    </View>
                    <AnswerModal
                        visible={this.state.modalVisible}
                        answerModalClose={() => this.answerModalClose()}
                        explanation={questionList.explanation}
                        Next={() => { this.nextQuestion(), MusicFunc('Button_Click_Music') }}
                        title="Next"
                    />
                </ImageBackground>
                :
                <Loader visible={this.state.isLoading} />
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
        paddingVertical: scaleHeight(5)
    },
    terms: {
        fontSize: normalizeFont(20),
        color: 'black',
        fontWeight: '800',
        textAlign: 'center',
        marginVertical: scaleHeight(5),
        marginHorizontal: scaleWidth(15),
        width: width - scaleWidth(30),
    },
    pointsBubble: {
        backgroundColor: "green",
        height: scaleHeight(25), width: scaleWidth(25), borderRadius: (scaleHeight(50) + scaleWidth(50)) / 2,

    }
});

class AddPoints extends Component {
    constructor() {
        super();
        this.state = {}
        this.state.left = new Animated.Value(85);
        this.state.bottom = new Animated.Value(50);
        this.state.left1 = new Animated.Value(-27);
        this.state.bottom1 = new Animated.Value(55);

    }
    componentDidMount() {
        Animated.sequence([
            Animated.sequence([
                Animated.parallel([
                    Animated.spring(this.state.left, { toValue: 85 }),
                    Animated.spring(this.state.bottom, { toValue: 50 }),
                    // Animated.timing(this.state.fadeAnim , { toValue: 0 } )
                ]),
                Animated.parallel([
                    Animated.spring(this.state.left, { toValue: -17 }),
                    Animated.spring(this.state.bottom, { toValue: 81 }),
                    // Animated.timing(this.state.fadeAnim , { toValue: 1 } )
                ]),
            ]),
            Animated.sequence([
                Animated.parallel([
                    Animated.spring(this.state.left1, { toValue: -27 }),
                    Animated.spring(this.state.bottom1, { toValue: 55 }),
                    // Animated.timing(this.state.fadeAnim , { toValue: 0 } )
                ]),
                Animated.parallel([
                    Animated.spring(this.state.left1, { toValue: -110 }),
                    Animated.spring(this.state.bottom1, { toValue: 10 }),
                    // Animated.timing(this.state.fadeAnim , { toValue: 1 } )
                ]),
            ])
        ]).start(() => {
            setTimeout(() => {
                this.props.animationComplete(this.props.count);
            })
        }, 500);
    }
    render() {
        return (
            <View>
                <Animated.View style={[styles.pointsBubble, {
                    left: this.state.left,
                    top: this.state.bottom,
                }]}>
                    {/* <Image source={points} style={{width: scaleWidth(100) , height: scaleHeight(100)}}resizeMode="stretch"/> */}
                    <Text style={{ color: "white", textAlign: "center" }}>
                        +{this.props.count}
                    </Text>
                    {/* </ImageBackground> */}
                </Animated.View>
                <Animated.View style={{
                    left: this.state.left1,
                    top: this.state.bottom1,
                }}>
                    <ImageBackground source={require('../image/Gameplay/score.png')} style={{ height: scaleHeight(40), width: scaleWidth(40), alignItems: "center", justifyContent: "center", transform: [{ rotate: '180deg' }] }} resizeMode="contain">
                        <Text style={{ color: "white", fontSize: normalizeFont(13), transform: [{ rotate: '180deg' }] }}>
                            +{this.props.count}
                        </Text>
                    </ImageBackground>
                </Animated.View>
            </View>
        )
    }

}
