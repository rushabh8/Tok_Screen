import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    Alert,
    ScrollView,
    TouchableOpacity,
    ImageBackground,
    Modal,
    Dimensions,
    Easing,
    Animated,
    Platform,
    AsyncStorage,
    BackHandler,
    ToastAndroid
} from 'react-native';
import { scaleWidth, scaleHeight, normalizeFont } from '../components/common/Responsive';
import { MusicFunc } from '../components/common/SoundFunc';
import ProfileAlert from './profileModal'
import AnswerModal from './answerModal';
import QuitModal from './quitModal';
import Loader from './loader';
import { socket, initUser } from '../webService/global'
import webservice from '../webService/Api';
import { userProfileData, otherUserProfile, otherUserProfileData } from '../webService/ApiStore';
import Textellipsis from '../components/common/Textellipsis';

const { width, height } = Dimensions.get('window');
const greyDot = require('../image/question/greyDot.png')
const redDot = require('../image/question/redDot.png');
const greenDot = require('../image/question/greenDot.png');
const defaultQuestionBG = require('../image/question/Question1.png')
const rightQuestionBG = require('../image/question/Green.png')
const wrongQuestionBG = require('../image/question/Red.png')
const back = require('../image/BackIcon/back-icon.png')
const defaultImage = require('../image/Invite_friend/user.png')
const profileImage = require('../image/user.png')

// ******* counter vaiables to control overlapping ************
let correctAnswer, playerReadyCount = 0, gameLeftCount = 0, otherAnswerCount = 0, scoreCount = 0

export default class QuestionTop10Dual extends Component {

    constructor(props) {
        super(props);
        this.state = {
            onCheckedAnswer: false,
            subCategoryId: null,
            questionArray: [],
            modalVisible: false,
            quitModal: false,
            selectedLanguage: 'English',
            gameType: '',
            index: 0,
            right: false,
            wrong: false,
            rightCount: 0,
            wrongCount: 0,
            selected_a: null,
            selected_b: null,
            selected_c: null,
            selected_d: null,
            score1: 0,
            score2: 0,
            timeRemaining: 10,
            userId: "",
            otherUserId: "",
            name: "",
            otherName: "",
            country: "",
            country2: "",
            state: "",
            state2: "",
            win: "",
            win2: "",
            lose: "",
            lose2: "",
            image1: '',
            image2: '',
            Avatar: null,
            isLoading: false,
            otherPlayerAnswer: null,
            connected: null,
            senderId: '',
            receiverId: '',
            oneTimeClick: true,
            bothUserSelected: false,
            otherAns: false,
            otherUserSelected: '',
            otherSelected_a: false,
            otherSelected_b: false,
            otherSelected_c: false,
            otherSelected_d: false,
            lock: false,
            winStatus: false,
            profile2Modal: false,
            graphArray: [{
                "Player1": [],
                "Player2": []
            }],
            bothPlayerReady: false,
            gamePlayType: '',
            dualGameObj: '',
            tempGraph: ''
        }
        this.animatedValue0 = new Animated.Value(0)
        this.animatedValue1 = new Animated.Value(0)
        this.animatedValue2 = new Animated.Value(0)
        this.animatedValue3 = new Animated.Value(0)
        this.animatedValue4 = new Animated.Value(0)
        this.animatedValue5 = new Animated.Value(0)
        this.animatedValue6 = new Animated.Value(0)
        this.animatedValue7 = new Animated.Value(0)
    }

    componentDidMount() {
        //console.log('did mount called')
        this._getLoaded()
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    }

    _getLoaded() {
        //console.log('get loaded called')
        MusicFunc('Background_Music', 'stop')
        this.setState({ isLoading: true })

        //  ******************** get gameType ********************

        let type = this.props.navigation.state.params.data
        let { params } = this.props.navigation.state
        this.setState({
            gameType: type.playGameWith,
            image2: type.image2,
            senderId: type.senderId,
            receiverId: type.userId,
            otherUserId: type.userId,
            otherUserData: type.otherUserData,
            gamePlayType: type.gamePlayType
        })
        if (!this.state.gameType === "friend" || "random") this.setState({ otherName: type.friendName })
        this.animate()

        //  ******************** get userId ********************

        AsyncStorage.getItem('userId').then((id) => {
            this.setState({ userId: JSON.parse(id) })
        })

        setTimeout(() => {
            this.setState({
                name: userProfileData.name,
                country: userProfileData.country,
                state: userProfileData.state,
                win: userProfileData.win,
                lose: userProfileData.lose,
                image1: userProfileData.avatar,

                otherName: otherUserProfileData.name,
                image2: otherUserProfileData.avatar,
                country2: otherUserProfileData.country,
                state2: otherUserProfileData.state,
                win2: otherUserProfileData.win,
                lose2: otherUserProfileData.lose,
                myTopics2: otherUserProfileData.interests
            })
        }, 500);

        //  ******************** get gameRoomId ********************

        AsyncStorage.getItem('gameRoomId').then((res) => {
            this.setState({ gameRoomId: JSON.parse(res) })
        })

        //  ******************** get subCategoryId ********************

        AsyncStorage.getItem('subCategoryId').then((id) => {
            this.setState({ subCategoryId: id })
        })

        //  ******************** get language ********************

        AsyncStorage.getItem('language').then((lang) => {
            if (lang == null) {
                this.setState({ selectedLanguage: 'English' })
            }
            else {
                this.setState({ selectedLanguage: lang })
            }
        })

        // ************************ Music Handling ****************

        setTimeout(() => {
            MusicFunc('Question_Appear_Music');
            this.setUserStatus()
            this.getQuestions()
        }, 1000)

        setTimeout(() => {
            MusicFunc('Option_Appear_Music');
        }, 2000);

        // Sockets Applied to get otherPlayer ANswer ******

        socket.on('player_ready', (data) => {
            //console.log("Both Players are ready ....", data);
            if (playerReadyCount == 0) {
                // //console.log("Both Players are ready ....", data);
                this.state.bothPlayerReady !== true ? this.setState({ bothPlayerReady: true, isLoading: false, dualGameObj: data.updatedData }) : null
                setTimeout(() => {
                    // this.timer();
                }, 500);
                playerReadyCount = 1
            }
        })

        socket.on('otherAnswer', (data) => {
            //console.log('other answer===>>> ' + JSON.stringify(data))
            this.setState({ bothUserSelected: true, otherUserSelected: data.otherPlayerAns, dualGameObj: data.dualGameObj })
            this.matchAnswer(data.otherPlayerAns);
        })

        socket.on('myScore', (scoreData) => {
            //console.log("Other Player score Data", JSON.stringify(scoreData))
            this.setState({ score2: JSON.stringify(scoreData.other_player_score_new.currentScore) })
            // // ~~~~~~~~~~~ store Graph Data ~~~~~~~~~~~~~~

            let temp = scoreData.scoreGameObj[this.state.receiverId].scoreArr
            let count = 0
            this.setState({ tempGraph: temp })
            if (this.state.index == 9) {
                if (count == 0) {
                    count++
                    //console.log("counter-->> >>" + count)
                    for (i in temp) {
                        let graphData = {}
                        graphData =
                            {
                                'score2': temp[i].currentQuesScore,
                                'timeRemaining2': temp[i].timeRemaining
                            }
                        this.state.graphArray[0].Player2.push(graphData)
                    }
                }
            }
        })

        socket.on('gameLeft', (data) => {
            //console.log("game left ==>>>." + data)
            if (gameLeftCount == 0) {
                clearInterval(this.interval)
                MusicFunc('Clock_Tik_Music', "stop")
                setTimeout(() => { Alert.alert('TOK', "Other Player left the game", [{ text: 'OK', onPress: () => this.props.navigation.navigate('Home') }]) }, 100)
                gameLeftCount = 1
            }
        })

        setTimeout(() => {
            // this.state.gameType === 'random' ? 
            this.timer()
            // : null;
            JSON.stringify(otherUserProfileData).length != 0 ? this.ViewOtherPlayerProfile() : null
        }, 500);

    }

    componentWillUnmount() {
        clearInterval(this.interval)
    }

    // ********************* handle Back Button **********************
    handleBackButton() {
        ToastAndroid.show('You can not go back from this page using back button', ToastAndroid.SHORT);
        return true;
    }

    //  ******************** start timer function ********************

    timer() {
        clearInterval(this.interval)
        setTimeout(() => {
            this.setState({ isLoading: false })
            setTimeout(() => {
                MusicFunc('Clock_Tik_Music', 'play')
            }, 1000);
            if (this.state.timeRemaining !== 0) this.interval = setInterval(() => { this.tick() }, 1000)
        }, 2500)
    }

    //  ******************** timer function ********************


    tick(otherUserSelectAns) {
        let { questionArray, index } = this.state;
        let checkAns = this.state.questionArray[this.state.index]
        if (this.state.timeRemaining == 0) {
            MusicFunc('Clock_Tik_Music', 'stop')
            let socket_req = {
                "gameId": this.state.gameRoomId,
                "question_Id": questionArray[index].question_Id,
                "correctAnswer": '0',
                "sentRequestBy": this.state.senderId,
                "sentRequestTo": this.state.receiverId,
                "dualGameObj": this.state.dualGameObj
            }

            socket.emit('isUserOnline', this.state.userId, (returnData) => {
                //console.log('user online tick ->>>>' + returnData)
                if (returnData.key)
                    socket.emit('otherAnswer', socket_req)
                else {
                    initUser(this.state.userId, this.state.name)
                    setTimeout(() => {
                        socket.emit('otherAnswer', socket_req)
                    }, 500);
                }
            })

            if (this.state.gameType === 'random') {
                this.setState({ bothUserSelected: false })
                //console.log('timer completed')
                if (this.state.onCheckedAnswer == false) {
                    if (correctAnswer == "a") {
                        MusicFunc('Right_Answer_Music');
                        checkAns.valueOther = 'red'
                        this.setState({ selected_a: true, right: true, });
                        setTimeout(() => {
                            this.nextQuestion()
                        }, 1000)
                    }
                    else if (correctAnswer == "b") {
                        MusicFunc('Right_Answer_Music');
                        checkAns.valueOther = 'red'
                        this.setState({ selected_b: true, right: true, });
                        setTimeout(() => {
                            this.nextQuestion()
                        }, 1000)
                    }
                    else if (correctAnswer == "c") {
                        MusicFunc('Right_Answer_Music');
                        checkAns.valueOther = 'red'
                        this.setState({ selected_c: true, right: true, });
                        setTimeout(() => {
                            this.nextQuestion()
                        }, 1000)
                    }
                    else if (correctAnswer == "d") {
                        MusicFunc('Right_Answer_Music');
                        checkAns.valueOther = 'red'
                        this.setState({ selected_d: true, right: true, });
                        setTimeout(() => {
                            this.nextQuestion()
                        }, 1000)
                    }

                    otherUserSelectAns == correctAnswer ? checkAns.valueOther = 'green' : checkAns.valueOther = 'red'

                    if (otherUserSelectAns == "a") {
                        this.setState({ otherSelected_a: otherUserSelectAns != correctAnswer ? true : false })
                    } else if (otherUserSelectAns == "b") {
                        this.setState({ otherSelected_b: otherUserSelectAns != correctAnswer ? true : false })
                    } else if (otherUserSelectAns == "c") {
                        this.setState({ otherSelected_c: otherUserSelectAns != correctAnswer ? true : false })
                    } else if (otherUserSelectAns == "d") {
                        this.setState({ otherSelected_d: otherUserSelectAns != correctAnswer ? true : false })
                    }

                    setTimeout(() => {
                        clearInterval(this.interval)
                    }, 500)
                }
            }
            clearInterval(this.interval)
            return;
        }
        else {
            if (!this.state.onCheckedAnswer) {
                this.setState({ timeRemaining: this.state.timeRemaining - 1, lock: false })
                // timerCount(this.state.timeRemaining)
            }
            if (this.state.modalVisible == true) {
                var remainingTime = this.state.timeRemaining;
                this.setState({ remainingTime: remainingTime })
            }
        }
    }

    matchAnswer(otherUserSelectAns) {
        //console.log('inside match answer')
        let { questionArray, index } = this.state;
        let checkAns = questionArray[index]
        this.setState({ bothUserSelected: false })
        if (this.state.onCheckedAnswer == false) {
            if (correctAnswer == "a") {
                MusicFunc('Right_Answer_Music');
                checkAns.valueOther = 'red'
                this.setState({ selected_a: true, right: true, });
                setTimeout(() => {
                    this.nextQuestion()
                }, 1000)
            }
            else if (correctAnswer == "b") {
                MusicFunc('Right_Answer_Music');
                checkAns.valueOther = 'red'
                this.setState({ selected_b: true, right: true, });
                setTimeout(() => {
                    this.nextQuestion()
                }, 1000)
            }
            else if (correctAnswer == "c") {
                MusicFunc('Right_Answer_Music');
                checkAns.valueOther = 'red'
                this.setState({ selected_c: true, right: true, });
                setTimeout(() => {
                    this.nextQuestion()
                }, 1000)
            }
            else if (correctAnswer == "d") {
                MusicFunc('Right_Answer_Music');
                checkAns.valueOther = 'red'
                this.setState({ selected_d: true, right: true, });
                setTimeout(() => {
                    this.nextQuestion()
                }, 1000)
            }

            otherUserSelectAns == correctAnswer ? checkAns.valueOther = 'green' : checkAns.valueOther = 'red'

            if (otherUserSelectAns == "a") {
                this.setState({ otherSelected_a: otherUserSelectAns != correctAnswer ? true : false })
            } else if (otherUserSelectAns == "b") {
                this.setState({ otherSelected_b: otherUserSelectAns != correctAnswer ? true : false })
            } else if (otherUserSelectAns == "c") {
                this.setState({ otherSelected_c: otherUserSelectAns != correctAnswer ? true : false })
            } else if (otherUserSelectAns == "d") {
                this.setState({ otherSelected_d: otherUserSelectAns != correctAnswer ? true : false })
            }

            setTimeout(() => {
                clearInterval(this.interval)
            }, 500)
        }
        clearInterval(this.interval)
        return;
    }

    logoutModalOpen = (visible) => {
        this.setState({ logoutModal: !visible });
    }
    logoutModalClose = (visible) => {
        this.setState({ logoutModal: false })
    }

    // ************************* view OTHER USER profile *****************************

    ViewOtherPlayerProfile = () => {
        let variables = {
            "userId": this.state.otherUserId
        }
        return webservice(variables, "users/viewProfile", "POST")
            .then(resp => {
                if (resp.data.responseCode === 200) {
                    otherUserProfile(resp.data.data[0])
                    this.setState({
                        otherName: resp.data.data[0].name,
                        image2: resp.data.data[0].avatar,
                        country2: resp.data.data[0].country,
                        state2: resp.data.data[0].state,
                        win2: resp.data.data[0].win,
                        lose2: resp.data.data[0].lose,
                        myTopics2: resp.data.data[0].interests
                    })
                }
            })
    }


    //  ******************** animation functions ********************

    animate() {
        this.animatedValue0.setValue(0)
        this.animatedValue1.setValue(0)
        this.animatedValue2.setValue(0)
        this.animatedValue3.setValue(0)
        this.animatedValue4.setValue(0)
        this.animatedValue5.setValue(0)
        this.animatedValue6.setValue(0)
        this.animatedValue7.setValue(0)

        const createAnimation = (value, duration, easing, delay = 0) => {
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
            createAnimation(this.animatedValue0, 1000, Easing.ease, 2000),
            createAnimation(this.animatedValue2, 1000, Easing.ease, 2000),
            createAnimation(this.animatedValue3, 1000, Easing.ease, 2000),
            createAnimation(this.animatedValue4, 1000, Easing.ease, 2000),
            createAnimation(this.animatedValue5, 1000, Easing.ease, 2000),
            createAnimation(this.animatedValue6, 1000, Easing.ease, 3500),
            createAnimation(this.animatedValue7, 1000, Easing.ease, 4000),
        ]).start()
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

    //  ******************** get the questions using gameRoomId ********************

    getQuestions(id) {
        this.setState({ isLoading: true })
        let variables = {
            "gameRoomId": this.state.gameRoomId
        }
        return webservice(variables, "topten/getQuestionByRoomID", "POST")
            .then(resp => {
                if (resp.data.responseCode === 200) {
                    for (let i in resp.data.data) {
                        resp.data.data[i]["selectAnswer"] = ""
                        resp.data.data[i]["value"] = ""
                    }
                    this.setState({ questionArray: resp.data.data, isLoading: false })

                    // emit socket "Ready"
                    let readySocketData = {
                        "status": true,
                        "sentRequestBy": this.state.senderId,
                        "sentRequestTo": this.state.receiverId,
                        "game_id": this.state.gameRoomId
                    }
                    // socket.emit('playerStatus', readySocketData)

                }
                else if (resp.data.responseCode === 400) {
                    this.setState({ isLoading: false })
                    alert("400--" + resp.data.responseMessage)
                }
                else if (resp.data.responseCode === 1000) {
                    alert(resp.data.responseMessage)
                }
            })
    }

    //  ******************** check the selected Answer ********************

    onCheckedAnswer(answer, qusId) {
        let { questionArray } = this.state;
        let checkAns = this.state.questionArray[this.state.index]
        MusicFunc('Clock_Tik_Music', "stop")
        if (this.state.gameType === 'friend') {
            if (this.state.oneTimeClick) {
                let socket_req = {
                    "gameId": this.state.gameRoomId,
                    "question_Id": qusId,
                    "myScore": this.state.score1,
                    "correctAnswer": answer,
                    "sentRequestBy": this.state.senderId,
                    "sentRequestTo": this.state.receiverId,
                    "dualGameObj": this.state.dualGameObj
                }
                //console.log('scoket data for other Answer ===>>> ' + JSON.stringify(socket_req) + "     chech konline   " + this._checkUserOnline())
                socket.emit('isUserOnline', this.state.userId, (returnData) => {
                    //console.log('user online onCheckAnswer ->>>>' + returnData)
                    if (returnData.key)
                        socket.emit('otherAnswer', socket_req)
                    else {
                        initUser(this.state.userId, this.state.name)
                        setTimeout(() => {
                            socket.emit('otherAnswer', socket_req)
                        }, 500);
                    }
                })

                let correctAnswer = this.state.questionArray[this.state.index].correctAnswer
                let { otherPlayerAnswer } = this.state
                if (answer === "a") {
                    if (correctAnswer === answer) {
                        this.setState({ selected_a: true, rightCount: this.state.rightCount + 1, oneTimeClick: false })
                        MusicFunc('Right_Answer_Music');
                        checkAns.value = 'green'
                        this.updateScore(answer, qusId)
                    }
                    else {
                        this.setState({ selected_a: false, wrongCount: this.state.wrongCount + 1, oneTimeClick: false })
                        MusicFunc('Wrong_Answer_Music')
                        checkAns.value = 'red'
                        this.updateScore(answer, qusId)
                    }
                }
                else if (answer === "b") {
                    if (correctAnswer === answer) {
                        this.setState({ selected_b: true, rightCount: this.state.rightCount + 1, oneTimeClick: false })
                        MusicFunc('Right_Answer_Music');
                        checkAns.value = 'green'
                        this.updateScore(answer, qusId)
                    }
                    else {
                        this.setState({ selected_b: false, wrongCount: this.state.wrongCount + 1, oneTimeClick: false })
                        MusicFunc('Wrong_Answer_Music')
                        this.updateScore(answer, qusId)
                        checkAns.value = 'red'
                    }
                }
                else if (answer === "c") {
                    if (correctAnswer === answer) {
                        this.setState({ selected_c: true, rightCount: this.state.rightCount + 1, oneTimeClick: false })
                        MusicFunc('Right_Answer_Music');
                        checkAns.value = 'green'
                        this.updateScore(answer, qusId)
                    }
                    else {
                        this.setState({ selected_c: false, wrongCount: this.state.wrongCount + 1, oneTimeClick: false })
                        MusicFunc('Wrong_Answer_Music')
                        checkAns.value = 'red'
                        this.updateScore(answer, qusId)
                    }
                }
                else if (answer === "d") {
                    if (correctAnswer === answer) {
                        this.setState({ selected_d: true, rightCount: this.state.rightCount + 1, oneTimeClick: false })
                        MusicFunc('Right_Answer_Music');
                        checkAns.value = 'green'
                        this.updateScore(answer, qusId)
                    }
                    else {
                        this.setState({ selected_d: false, wrongCount: this.state.wrongCount + 1, oneTimeClick: false })
                        MusicFunc('Wrong_Answer_Music')
                        checkAns.value = 'red'
                        this.updateScore(answer, qusId)
                    }
                }
                let { questionArray } = this.state;
                let selectAns = questionArray[this.state.index]
                selectAns.selectAnswer = answer;
                this.setState({ questionArray })
            }
        } else {
            this.setState({ lock: true })
            if (this.state.oneTimeClick) {
                let correctAnswer = this.state.questionArray[this.state.index].correctAnswer
                let { otherPlayerAnswer } = this.state
                if (answer === "a") {
                    if (correctAnswer === answer) {
                        this.setState({ selected_a: true, rightCount: this.state.rightCount + 1, oneTimeClick: false })
                        MusicFunc('Right_Answer_Music');
                        this.updateScore(answer)
                        checkAns.value = 'green'
                    }
                    else {
                        this.setState({ selected_a: false, wrongCount: this.state.wrongCount + 1, oneTimeClick: false })
                        MusicFunc('Wrong_Answer_Music')
                        checkAns.value = 'red'
                        this.updateScore(answer, qusId)
                    }
                    clearInterval(this.interval)
                    setTimeout(() => {
                        this.nextQuestion()
                    }, 1000)
                }
                else if (answer === "b") {
                    if (correctAnswer === answer) {
                        this.setState({ selected_b: true, rightCount: this.state.rightCount + 1, oneTimeClick: false })
                        MusicFunc('Right_Answer_Music');
                        this.updateScore(answer)
                        checkAns.value = 'green'
                    }
                    else {
                        this.setState({ selected_b: false, wrongCount: this.state.wrongCount + 1, oneTimeClick: false })
                        MusicFunc('Wrong_Answer_Music')
                        checkAns.value = 'red'
                        this.updateScore(answer, qusId)
                    }
                    clearInterval(this.interval)
                    setTimeout(() => {
                        this.nextQuestion()
                    }, 1000)
                }
                else if (answer === "c") {
                    if (correctAnswer === answer) {
                        this.setState({ selected_c: true, rightCount: this.state.rightCount + 1, oneTimeClick: false })
                        MusicFunc('Right_Answer_Music');
                        this.updateScore(answer)
                        checkAns.value = 'green'
                    }
                    else {
                        this.setState({ selected_c: false, wrongCount: this.state.wrongCount + 1, oneTimeClick: false })
                        MusicFunc('Wrong_Answer_Music')
                        checkAns.value = 'red'
                        this.updateScore(answer, qusId)
                    }
                    clearInterval(this.interval)
                    setTimeout(() => {
                        this.nextQuestion()
                    }, 1000)
                }
                else if (answer === "d") {
                    if (correctAnswer === answer) {
                        this.setState({ selected_d: true, rightCount: this.state.rightCount + 1, oneTimeClick: false })
                        MusicFunc('Right_Answer_Music');
                        this.updateScore(answer)
                        checkAns.value = 'green'
                    }
                    else {
                        this.setState({ selected_d: false, wrongCount: this.state.wrongCount + 1, oneTimeClick: false })
                        MusicFunc('Wrong_Answer_Music')
                        checkAns.value = 'red'
                        this.updateScore(answer, qusId)
                    }
                    clearInterval(this.interval)
                    setTimeout(() => {
                        this.nextQuestion()
                    }, 1000)
                }
                if (correctAnswer == "a") {
                    this.setState({ selected_a: true, right: true, oneTimeClick: false })
                }
                else if (correctAnswer == "b") {
                    this.setState({ selected_b: true, right: true, oneTimeClick: false })
                }
                else if (correctAnswer == "c") {
                    this.setState({ selected_c: true, right: true, oneTimeClick: false })
                }
                else if (correctAnswer == "d") {
                    this.setState({ selected_d: true, right: true, oneTimeClick: false })
                }

                this.onCheckedAnswerByOther()

                let { questionArray } = this.state;
                let selectAns = questionArray[this.state.index]
                selectAns.selectAnswer = answer;
                this.setState({ questionArray })
            }
        }
    }

    onCheckedAnswerByOther() {
        var items = ["a", "b", "c", "d"]
        var randomElement = Math.floor(Math.random() * items.length);
        let { questionArray } = this.state;
        let checkAns = this.state.questionArray[this.state.index]
        let correctAnswer = this.state.questionArray[this.state.index].correctAnswer
        let otherPlayerAnswer = items[randomElement]
        if (otherPlayerAnswer === "a") {
            if (correctAnswer === otherPlayerAnswer) {
                this.setState({ selected_a: true, })
                this.updateScoreOther(otherPlayerAnswer)
                checkAns.valueOther = 'green'
            }
            else {
                this.setState({ selected_a: false, })
                checkAns.valueOther = 'red'
                this.updateScoreOther(otherPlayerAnswer)
                // clearInterval(this.interval)
            }
        }
        else if (otherPlayerAnswer === "b") {
            if (correctAnswer === otherPlayerAnswer) {
                this.setState({ selected_b: true, })
                this.updateScoreOther(otherPlayerAnswer)
                checkAns.valueOther = 'green'
            }
            else {
                this.setState({ selected_b: false, })
                checkAns.valueOther = 'red'
                this.updateScoreOther(otherPlayerAnswer)
            }
            // clearInterval(this.interval)

        }
        else if (otherPlayerAnswer === "c") {
            if (correctAnswer === otherPlayerAnswer) {
                this.setState({ selected_c: true, })
                this.updateScoreOther(otherPlayerAnswer)
                checkAns.valueOther = 'green'
            }
            else {
                this.setState({ selected_c: false, })
                checkAns.valueOther = 'red'
                this.updateScoreOther(otherPlayerAnswer)
            }
            // clearInterval(this.interval)
        }
        else if (otherPlayerAnswer === "d") {
            if (correctAnswer === otherPlayerAnswer) {
                this.setState({ selected_d: true, })
                this.updateScoreOther(otherPlayerAnswer)
                checkAns.valueOther = 'green'
            }
            else {
                this.setState({ selected_d: false, })
                checkAns.valueOther = 'red'
                this.updateScoreOther(otherPlayerAnswer)
            }
            // clearInterval(this.interval)
        }

    }


    //  ******************** update score ********************

    updateScore(answer, qusId) {
        if (answer != null && answer === correctAnswer) this.setState({ score1: this.state.score1 + 10 + this.state.timeRemaining })

        // ~~~~~~~~~~~ store Graph Data ~~~~~~~~~~~~~~

        let graphData = {};
        graphData =
            {
                'score1': answer != null && answer === correctAnswer ? 10 : 0,
                'timeRemaining1': this.state.timeRemaining
            }
        this.state.graphArray[0].Player1.push(graphData)
        //console.log("graph data===>>>0", JSON.stringify(this.state.graphArray))

        setTimeout(() => {
            scoreObj = {
                "gameId": this.state.gameRoomId,
                "questionId": qusId,
                "questionNo": this.state.index + 1,
                "currentQuesScore": answer === correctAnswer ? 10 : 0,
                "myScore": this.state.score1,
                "sentRequestBy": this.state.senderId,
                "sentRequestTo": this.state.receiverId,
                "timeRemaining": this.state.timeRemaining
            };
            this.state.gameType === 'friend' ?
                socket.emit('isUserOnline', this.state.userId, (returnData) => {
                    //console.log('user online update score ->>>>' + returnData)
                    if (returnData.key)
                        socket.emit('myScore', scoreObj)
                    else {
                        initUser(this.state.userId, this.state.name)
                        setTimeout(() => {
                            socket.emit('myScore', scoreObj)
                        }, 500);
                    }
                })
                : null
        }, 500)
    }


    //  ******************** update score other player ********************

    updateScoreOther(answer) {
        if (answer === correctAnswer) this.setState({ score2: this.state.score2 + 10 + this.state.timeRemaining })

        // ~~~~~~~~~~ generate Random time in case of Random mode ~~~~~~~~~
        let timeArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        let timeRemaining2 = Math.floor(Math.random() * timeArray.length)

        // ~~~~~~~~~~ store Graph Data ~~~~~~~~~
        let graphData = {}
        graphData =
            {
                'score2': answer === correctAnswer ? 10 : 0,
                'timeRemaining2': this.state.gameType === 'friend' ? this.state.timeRemaining : timeRemaining2
            }
        this.state.graphArray[0].Player2.push(graphData)
        //console.log("graph data===>>>1", JSON.stringify(this.state.graphArray))
    }

    answerModalClose() {
        this.setState({ modalVisible: false })
    }

    //  ******************** Display next question ********************

    nextQuestion() {
        this.setState({ modalVisible: false, oneTimeClick: true, otherAns: false, otherSelected_a: false, otherSelected_b: false, otherSelected_c: false, otherSelected_d: false })
        let { index, questionArray } = this.state, gameCompleteCount = 0
        index++;
        //console.log('index after ++ >>>>>>>> ' + index)
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
            //console.log('index after ++ in else >>>>>>>> ' + index)
            gameCompleteCount = 1
            if (gameCompleteCount == 1) {
                this.setState({ isLoading: true })
                if (this.state.gameType === 'friend') {
                    comObj = {
                        'gameRoomId': this.state.gameRoomId,
                        "sentRequestBy": this.state.senderId,
                        "sentRequestTo": this.state.receiverId,
                    }
                    socket.emit('gameComplete', comObj)
                }
                //console.log("Game Completed ==>> " + JSON.stringify(comObj))
                this._gameResults()
                gameCompleteCount = 2
            }
        }
        this.setState({ selected_a: null, selected_b: null, selected_c: null, selected_d: null, timeRemaining: 10 })
        this.animate()
    }

    // ********************* game Results (win/lose) *************************

    _gameResults() {
        clearInterval(this.interval)
        let count = 0;
        if (this.state.score1 > this.state.score2) {
            this.setState({ winStatus: true })
        }

        let gameObj = {
            myUserId: this.state.userId,
            otherUserId: this.state.otherUserId,
            score1: this.state.score1,
            score2: this.state.score2,
            myQuestions: this.state.questionArray,
            subCategoryId: this.state.subCategoryId,
            right: this.state.rightCount,
            wrong: this.state.wrongCount,
            selectedLanguage: this.state.selectedLanguage,
            gameType: this.state.gameType,
            graphArray: this.state.graphArray,
            winStatus: this.state.winStatus,
            gamePlayType: this.state.gamePlayType
        }
        setTimeout(() => {
            //console.log("temporary data===>>> " + JSON.stringify(this.state.graphArray))
            this.setState({ lock: false, isLoading: false })
            this.props.navigation.navigate('Result', { gameObj: gameObj })
        }, 500);
    }

    //  ******************** Quit Game ********************

    _quitGame() {
        clearInterval(this.interval)
        MusicFunc('Clock_Tik_Music', "stop")
        this.setState({ quitModal: false })
        setTimeout(() => {
            var gameLeftObj = {
                "sentRequestBy": this.state.senderId,
                "sentRequestTo": this.state.receiverId,
                "gameRoomId": this.state.gameRoomId
            }
            this.state.gameType === 'friend' ? socket.emit('gameLeft', gameLeftObj) : null
            this.props.navigation.navigate("Home")
        }, 200);

    }

    //  ******************** check user Online ********************

    _checkUserOnline() {
        socket.emit('isUserOnline', this.state.userId, (returnData) => {
            if (!returnData.key) {
                return { data: false }
            }
            else {
                return { data: true }
            }
        })
    }

    resize() {
        let { index, questionArray } = this.state
        if (questionArray[index].english.a.length > 25 || questionArray[index].english.b.length > 25 || questionArray[index].english.c.length > 25 || questionArray[index].english.d.length > 25 || questionArray[index].hindi.a.length > 25 || questionArray[index].hindi.b.length > 25 || questionArray[index].hindi.c.length > 25 || questionArray[index].hindi.d.length > 25) {
            return 'yes'
        } else {
            return 'no'
        }
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
            outputRange: [-500, 1]
        })
        const opacity = this.animatedValue0.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1]
        })
        const exitButton = this.animatedValue6.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 400]
        })
        const exitButton1 = this.animatedValue7.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 500]
        })
        const introButton1 = this.animatedValue2.interpolate({
            inputRange: [0, 1],
            outputRange: [-50, 5]
        })
        const introButton2 = this.animatedValue3.interpolate({
            inputRange: [0, 1],
            outputRange: [-80, 6]
        })
        const introButton3 = this.animatedValue4.interpolate({
            inputRange: [0, 1],
            outputRange: [-120, 7]
        })
        const introButton4 = this.animatedValue5.interpolate({
            inputRange: [0, 1],
            outputRange: [-150, 8]
        })

        let { questionArray, index, selectedLanguage, right, wrong, otherSelected_a, otherSelected_b, otherSelected_c, otherSelected_d, score1, otherAns, otherUserSelected, score2, selected_a, selected_b, selected_c, selected_d } = this.state
        if (this.state.questionArray.length > 0) {
            if (index <= this.state.questionArray.length - 1) {
                if (selectedLanguage == 'English') {
                    questionList = questionArray[index].english
                    correctAnswer = questionArray[index].correctAnswer
                }
                else if ((selectedLanguage == 'Hindi')) {
                    questionList = questionArray[index].hindi
                    correctAnswer = questionArray[index].correctAnswer
                }
            }
        }
        // //console.log('value of index ==>> ' +this.state.index)

        return (
            // this.state.bothPlayerReady ?
            this.state.questionArray.length > 0 ?

                <ImageBackground source={require('../image/Invite_friend/bg.png')} style={{ flex: 1 }} >
                    <Loader visible={this.state.isLoading} />

                    <View style={{}}>
                        <View style={{ paddingTop: scaleHeight(10) }}>
                            <View style={{ flexDirection: 'row' }}>
                                <TouchableOpacity style={{}} onPress={() => { this.setState({ quitModal: true }), MusicFunc('Clock_Tik_Music', "stop"), MusicFunc('Button_Click_Music') }}>
                                    <Image source={back} style={{ width: scaleWidth(25), height: scaleHeight(25) }} />
                                </TouchableOpacity>
                                <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'space-between', paddingHorizontal: scaleWidth(10) }}>
                                    <View style={{ alignItems: 'center' }}>
                                        <Text style={{ fontSize: normalizeFont(18), textAlign: 'left' }}>
                                            <Textellipsis mytextvar={this.state.name} maxlimit={15} ></Textellipsis>
                                        </Text>
                                    </View>
                                    <View style={{ alignItems: 'center' }}>
                                        <Text style={{ fontSize: normalizeFont(18), textAlign: 'right', right: scaleWidth(15) }}>
                                        <Textellipsis mytextvar={this.state.otherName} maxlimit={15} ></Textellipsis>
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <QuitModal
                            visible={this.state.quitModal}
                            message="Are you sure you want to quit game?"
                            No={() => this.setState({ quitModal: false })}
                            Yes={() => this._quitGame()}
                        />

                        {this.state.logoutModal ?
                            <ProfileAlert
                                onRequestClose={() => { this.logoutModalOpen(!this.state.logoutModal) }}
                                visible={this.state.logoutModal}
                                alertMessage={this.state.alertMessage}
                                cancelButton={() => this.setState({ logoutModal: false })}
                                logoutModalClose={() => this.logoutModalClose(this.state.logoutModal)}
                                image={this.state.image1}
                                name={this.state.name}
                                country={this.state.country}
                                states={this.state.states}
                                win={this.state.win}
                                lose={this.state.lose}

                            /> : null
                        }

                        <ProfileAlert
                            onRequestClose={() => { this.state.profile2Modal }}
                            visible={this.state.profile2Modal}
                            // alertMessage={this.state.alertMessage}
                            cancelButton={() => this.setState({ profile2Modal: false })}
                            logoutModalClose={() => this.setState({ profile2Modal: false })}
                            image={this.state.image2}
                            name={this.state.otherName}
                            country={this.state.country2}
                            states={this.state.states2}
                            win={this.state.win2}
                            lose={this.state.lose2}

                        />


                        <View style={styles.termsContainer}>
                            <View style={{ flexDirection: 'row', }}>

                                <TouchableOpacity onPress={() => { this.logoutModalOpen() }}
                                    style={{ shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.5, shadowRadius: 1, }}>
                                    <Image source={this.state.image1 ? { uri: this.state.image1 } : profileImage} style={{
                                        width: scaleWidth(80), height: Platform.OS === 'ios' ? scaleHeight(80) : scaleHeight(100), borderRadius: 10, borderColor: 'white', borderWidth: 5,
                                    }} />
                                </TouchableOpacity>
                                <ImageBackground source={require('../image/Gameplay/Bluescroce.png')} style={{ alignSelf: 'center', left: scaleWidth(5) }} >
                                    <Text style={{ color: 'white', padding: 7, }}>{score1}</Text>
                                </ImageBackground>
                            </View>

                            {/* <ImageBackground source={require('../image/Gameplay/clock.png')} style={{ height: scaleHeight(60), width: scaleWidth(50), alignSelf: 'center', justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ fontSize: normalizeFont(18), color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>{this.state.timeRemaining}</Text>
                            </ImageBackground> */}

                            <ImageBackground source={require('../image/Gameplay/score.png')} resizeMode='stretch' style={{ height: scaleHeight(30), width: scaleWidth(40), alignSelf: 'center', justifyContent: 'center', alignItems: 'center', transform: [{ rotate: '179deg' }] }}>
                                <Text style={{ fontSize: 18, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}></Text>
                            </ImageBackground>

                            <ImageBackground source={require('../image/Gameplay/clock.png')} resizeMode='stretch' style={{ height: scaleHeight(60), width: scaleWidth(50), alignSelf: 'flex-start', justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ fontSize: 18, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>{this.state.timeRemaining}</Text>
                            </ImageBackground>

                            <ImageBackground source={require('../image/Gameplay/score.png')} resizeMode='stretch' style={{ height: scaleHeight(30), width: scaleWidth(40), alignSelf: 'center', justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ fontSize: 18, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}></Text>
                            </ImageBackground>

                            <View style={{ flexDirection: 'row', }}>
                                <ImageBackground source={require('../image/Gameplay/Orangescore.png')} style={{ alignSelf: 'center', left: scaleWidth(5) }} >
                                    <Text style={{ color: 'white', padding: 7, }}>{score2}</Text>
                                </ImageBackground>
                                <TouchableOpacity onPress={() => { this.setState({ profile2Modal: true }) }}
                                    style={{ shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.5, shadowRadius: 1, }}>
                                    <Image source={this.state.image2 ? { uri: this.state.image2 } : profileImage} style={{
                                        width: scaleWidth(80), height: Platform.OS === 'ios' ? scaleHeight(80) : scaleHeight(100), borderRadius: 10, borderColor: 'white', borderWidth: 5,
                                    }} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <Image source={require('../image/Gameplay/line.png')} style={{ width }} />
                        <View style={{ flexDirection: 'row', alignItems: 'center', width }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 3, marginLeft: scaleWidth(7.5), marginRight: scaleWidth(40) }}>
                                <Image source={questionArray[0].value == 'green' ? greenDot : questionArray[0].value == 'red' ? redDot : greyDot} resizeMode='stretch' />
                                <Image source={questionArray[1].value == 'green' ? greenDot : questionArray[1].value == 'red' ? redDot : greyDot} resizeMode='stretch' />
                                <Image source={questionArray[2].value == 'green' ? greenDot : questionArray[2].value == 'red' ? redDot : greyDot} resizeMode='stretch' />
                                <Image source={questionArray[3].value == 'green' ? greenDot : questionArray[3].value == 'red' ? redDot : greyDot} resizeMode='stretch' />
                                <Image source={questionArray[4].value == 'green' ? greenDot : questionArray[4].value == 'red' ? redDot : greyDot} resizeMode='stretch' />
                                <Image source={questionArray[5].value == 'green' ? greenDot : questionArray[5].value == 'red' ? redDot : greyDot} resizeMode='stretch' />
                                <Image source={questionArray[6].value == 'green' ? greenDot : questionArray[6].value == 'red' ? redDot : greyDot} resizeMode='stretch' />
                                <Image source={questionArray[7].value == 'green' ? greenDot : questionArray[7].value == 'red' ? redDot : greyDot} resizeMode='stretch' />
                                <Image source={questionArray[8].value == 'green' ? greenDot : questionArray[8].value == 'red' ? redDot : greyDot} resizeMode='stretch' />
                                <Image source={questionArray[9].value == 'green' ? greenDot : questionArray[9].value == 'red' ? redDot : greyDot} resizeMode='stretch' />
                            </View>
                            <View style={{ justifyContent: 'center' }} >
                                <ImageBackground source={require('../image/Gameplay/Questtion.png')} style={{ alignItems: 'center', paddingHorizontal: scaleWidth(5) }} resizeMode='stretch' >
                                    <Text style={{ color: 'white', fontWeight: '600', fontSize: normalizeFont(17) }}>Q. {index + 1}</Text>
                                </ImageBackground>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 3, marginRight: scaleWidth(7.5), marginLeft: scaleWidth(40) }}>
                                <Image source={questionArray[9].valueOther == 'green' ? greenDot : questionArray[9].valueOther == 'red' ? redDot : greyDot} resizeMode='stretch' />
                                <Image source={questionArray[8].valueOther == 'green' ? greenDot : questionArray[8].valueOther == 'red' ? redDot : greyDot} resizeMode='stretch' />
                                <Image source={questionArray[7].valueOther == 'green' ? greenDot : questionArray[7].valueOther == 'red' ? redDot : greyDot} resizeMode='stretch' />
                                <Image source={questionArray[6].valueOther == 'green' ? greenDot : questionArray[6].valueOther == 'red' ? redDot : greyDot} resizeMode='stretch' />
                                <Image source={questionArray[5].valueOther == 'green' ? greenDot : questionArray[5].valueOther == 'red' ? redDot : greyDot} resizeMode='stretch' />
                                <Image source={questionArray[4].valueOther == 'green' ? greenDot : questionArray[4].valueOther == 'red' ? redDot : greyDot} resizeMode='stretch' />
                                <Image source={questionArray[3].valueOther == 'green' ? greenDot : questionArray[3].valueOther == 'red' ? redDot : greyDot} resizeMode='stretch' />
                                <Image source={questionArray[2].valueOther == 'green' ? greenDot : questionArray[2].valueOther == 'red' ? redDot : greyDot} resizeMode='stretch' />
                                <Image source={questionArray[1].valueOther == 'green' ? greenDot : questionArray[1].valueOther == 'red' ? redDot : greyDot} resizeMode='stretch' />
                                <Image source={questionArray[0].valueOther == 'green' ? greenDot : questionArray[0].valueOther == 'red' ? redDot : greyDot} resizeMode='stretch' />
                            </View>
                        </View>

                        <ScrollView>
                            <View style={{ justifyContent: 'center', alignItems: 'center', height: height / 3 * 2 }}>
                                {this.state.onCheckedAnswer ?
                                    <Animated.View style={{ left: exitButton, zIndex: 1, position: 'relative', top: 0, backgroundColor: 'transparent' }}>
                                        <Text multiline={true} style={styles.terms}>
                                            {questionList.question}
                                        </Text>
                                    </Animated.View>
                                    :
                                    <Animated.View style={{ left: introButton, zIndex: 1, position: 'relative', top: 0, backgroundColor: 'transparent' }}>
                                        <Text multiline={true} style={styles.terms}>
                                            {questionList.question}
                                        </Text>
                                    </Animated.View>}
                                {this.state.onCheckedAnswer ?
                                    // <Animated.View style={{ top: exitButton1, position: 'relative', zIndex: 0, position: 'relative' }}>
                                    //     <TouchableOpacity onPress={() => this.onCheckedAnswer("a", this.state.questionArray[index].question_Id)} style={{ marginVertical: 10, }} >
                                    //         <Image source={otherSelected_a ? wrongQuestionBG : right ? rightQuestionBG : wrong ? wrongQuestionBG : defaultQuestionBG} style={{ zIndex: 0, position: 'relative' }} resizeMode='stretch' />
                                    //         <Text style={{ zIndex: 1, position: 'absolute', alignSelf: 'center', top: 15, color: 'black', fontWeight: '800', fontSize: normalizeFont(17) }}>{questionList.a}</Text>
                                    //     </TouchableOpacity>
                                    //     <TouchableOpacity onPress={() => this.onCheckedAnswer("b", this.state.questionArray[index].question_Id)} style={{ marginVertical: 10, }} >
                                    //         <Image source={otherSelected_b ? wrongQuestionBG : right ? rightQuestionBG : wrong ? wrongQuestionBG : defaultQuestionBG} style={{ zIndex: 0, position: 'relative' }} resizeMode='stretch' />
                                    //         <Text style={{ zIndex: 1, position: 'absolute', alignSelf: 'center', top: 15, color: 'black', fontWeight: '800', fontSize: normalizeFont(17) }}>{questionList.b}</Text>
                                    //     </TouchableOpacity>

                                    //     <TouchableOpacity onPress={() => this.onCheckedAnswer("c", this.state.questionArray[index].question_Id)} style={{ marginVertical: 10, }} >
                                    //         <Image source={otherSelected_c ? wrongQuestionBG : right ? rightQuestionBG : wrong ? wrongQuestionBG : defaultQuestionBG} style={{ zIndex: 0, position: 'relative' }} resizeMode='stretch' />
                                    //         <Text style={{ zIndex: 1, position: 'absolute', alignSelf: 'center', top: 15, color: 'black', fontWeight: '800', fontSize: normalizeFont(17) }}>{questionList.c}</Text>
                                    //     </TouchableOpacity>

                                    //     <TouchableOpacity onPress={() => this.onCheckedAnswer("d", this.state.questionArray[index].question_Id)} style={{ marginVertical: 10, }} >
                                    //         <Image source={otherSelected_d ? wrongQuestionBG : right ? rightQuestionBG : wrong ? wrongQuestionBG : defaultQuestionBG} style={{ zIndex: 0, position: 'relative' }} resizeMode='stretch' />
                                    //         <Text style={{ zIndex: 1, position: 'absolute', alignSelf: 'center', top: 15, color: 'black', fontWeight: '800', fontSize: normalizeFont(17) }}>{questionList.d}</Text>
                                    //     </TouchableOpacity>

                                    // </Animated.View>
                                    <Animated.View style={{ opacity, top: 0 }} >
                                        <Animated.View style={{ top: introButton1, position: 'relative', zIndex: 0 }}>
                                            <TouchableOpacity onPress={() => this.onCheckedAnswer("a", this.state.questionArray[index].question_Id)} style={{ marginVertical: scaleHeight(6), }} >
                                                <ImageBackground source={selected_a ? rightQuestionBG : selected_a === false ? wrongQuestionBG : defaultQuestionBG} style={{ justifyContent: 'center', width: width - scaleWidth(75), height: scaleHeight(50) }} resizeMode='stretch' >
                                                    <Text style={{ alignSelf: 'center', color: 'black', fontWeight: '800', fontSize: this.resize() == 'yes' ? normalizeFont(13) : normalizeFont(17) }}>{questionList.a}</Text>
                                                </ImageBackground>
                                            </TouchableOpacity>
                                        </Animated.View>
                                        <Animated.View style={{ top: introButton2, position: 'relative', zIndex: 0 }}>
                                            <TouchableOpacity onPress={() => this.onCheckedAnswer("b", this.state.questionArray[index].question_Id)} style={{ marginVertical: scaleHeight(6), }} >
                                                <ImageBackground source={selected_b ? rightQuestionBG : selected_b === false ? wrongQuestionBG : defaultQuestionBG} style={{ justifyContent: 'center', width: width - scaleWidth(75), height: scaleHeight(50) }} resizeMode='stretch' >
                                                    <Text style={{ alignSelf: 'center', color: 'black', fontWeight: '800', fontSize: this.resize() == 'yes' ? normalizeFont(13) : normalizeFont(17) }}>{questionList.b}</Text>
                                                </ImageBackground>
                                            </TouchableOpacity>
                                        </Animated.View>
                                        <Animated.View style={{ top: introButton3, position: 'relative', zIndex: 0 }}>
                                            <TouchableOpacity onPress={() => this.onCheckedAnswer("c", this.state.questionArray[index].question_Id)} style={{ marginVertical: scaleHeight(6), }} >
                                                <ImageBackground source={selected_c ? rightQuestionBG : selected_c === false ? wrongQuestionBG : defaultQuestionBG} style={{ justifyContent: 'center', width: width - scaleWidth(75), height: scaleHeight(50) }} resizeMode='stretch' >
                                                    <Text style={{ alignSelf: 'center', color: 'black', fontWeight: '800', fontSize: this.resize() == 'yes' ? normalizeFont(13) : normalizeFont(17) }}>{questionList.c}</Text>
                                                </ImageBackground>
                                            </TouchableOpacity>
                                        </Animated.View>
                                        <Animated.View style={{ top: introButton4, position: 'relative', zIndex: 0 }}>
                                            <TouchableOpacity onPress={() => this.onCheckedAnswer("d", this.state.questionArray[index].question_Id)} style={{ marginTop: scaleHeight(6), marginBottom: scaleHeight(10), }} >
                                                <ImageBackground source={selected_d ? rightQuestionBG : selected_d === false ? wrongQuestionBG : defaultQuestionBG} style={{ justifyContent: 'center', width: width - scaleWidth(75), height: scaleHeight(50) }} resizeMode='stretch' >
                                                    <Text style={{ alignSelf: 'center', color: 'black', fontWeight: '800', fontSize: this.resize() == 'yes' ? normalizeFont(13) : normalizeFont(17) }}>{questionList.d}</Text>
                                                </ImageBackground>
                                            </TouchableOpacity>
                                        </Animated.View>
                                    </Animated.View>
                                    :
                                    <Animated.View
                                        style={{ opacity, top: Platform.OS === 'ios' ? 0 : -10 }} >
                                        <Animated.View style={{ top: introButton1, position: 'relative', zIndex: 0 }}>
                                            <TouchableOpacity onPress={() => this.onCheckedAnswer("a", this.state.questionArray[index].question_Id)} style={{ marginVertical: scaleHeight(10), }} >
                                                <Image source={otherSelected_a ? wrongQuestionBG : selected_a ? rightQuestionBG : selected_a === false ? wrongQuestionBG : defaultQuestionBG} style={{ zIndex: 0, position: 'relative' }} resizeMode='stretch' />
                                                <Text style={{ zIndex: 1, position: 'absolute', alignSelf: 'center', top: 15, color: 'black', fontWeight: '800', fontSize: this.resize() == 'yes' ? normalizeFont(13) : normalizeFont(17) }}>{questionList.a}</Text>
                                            </TouchableOpacity>
                                        </Animated.View>
                                        <Animated.View style={{ top: introButton2, position: 'relative', zIndex: 0 }}>
                                            <TouchableOpacity onPress={() => this.onCheckedAnswer("b", this.state.questionArray[index].question_Id)} style={{ marginVertical: scaleHeight(10), }} >
                                                <Image source={otherSelected_b ? wrongQuestionBG : selected_b ? rightQuestionBG : selected_b === false ? wrongQuestionBG : defaultQuestionBG} style={{ zIndex: 0, position: 'relative' }} resizeMode='stretch' />
                                                <Text style={{ zIndex: 1, position: 'absolute', alignSelf: 'center', top: 15, color: 'black', fontWeight: '800', fontSize: this.resize() == 'yes' ? normalizeFont(13) : normalizeFont(17) }}>{questionList.b}</Text>
                                            </TouchableOpacity>
                                        </Animated.View>
                                        <Animated.View style={{ top: introButton3, position: 'relative', zIndex: 0 }}>
                                            <TouchableOpacity onPress={() => this.onCheckedAnswer("c", this.state.questionArray[index].question_Id)} style={{ marginVertical: scaleHeight(10), }} >
                                                <Image source={otherSelected_c ? wrongQuestionBG : selected_c ? rightQuestionBG : selected_c === false ? wrongQuestionBG : defaultQuestionBG} style={{ zIndex: 0, position: 'relative' }} resizeMode='stretch' />
                                                <Text style={{ zIndex: 1, position: 'absolute', alignSelf: 'center', top: 15, color: 'black', fontWeight: '800', fontSize: this.resize() == 'yes' ? normalizeFont(13) : normalizeFont(17) }}>{questionList.c}</Text>
                                            </TouchableOpacity>
                                        </Animated.View>

                                        <Animated.View style={{ top: introButton4, position: 'relative', zIndex: 0 }}>
                                            <TouchableOpacity onPress={() => this.onCheckedAnswer("d", this.state.questionArray[index].question_Id)} style={{ marginVertical: scaleHeight(10), }} >
                                                <Image source={otherSelected_d ? wrongQuestionBG : selected_d ? rightQuestionBG : selected_d === false ? wrongQuestionBG : defaultQuestionBG} style={{ zIndex: 0, position: 'relative' }} resizeMode='stretch' />
                                                <Text style={{ zIndex: 1, position: 'absolute', alignSelf: 'center', top: 15, color: 'black', fontWeight: '800', fontSize: this.resize() == 'yes' ? normalizeFont(13) : normalizeFont(17) }}>{questionList.d}</Text>
                                            </TouchableOpacity>
                                        </Animated.View>
                                    </Animated.View>
                                }
                            </View>
                        </ScrollView>
                        <AnswerModal
                            visible={this.state.modalVisible}
                            answerModalClose={() => this.answerModalClose()}
                            explanation={questionList.explanation}
                            Next={() => this.nextQuestion()}
                            title="Next"
                        />
                        <Modal
                            visible={this.state.lock}
                            animationType='none'
                            transparent={true}
                        />
                    </View>
                </ImageBackground>
                :
                <Loader visible={this.state.isLoading} />
            // :
            // <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            //     <View style={{ alignItems: 'center', justifyContent: "center", flex: 1 }}>
            //         <Text style={{ fontSize: 24, textAlign: 'center' }}>Please wait...</Text>
            //         <Image resizeMode="stretch" source={require('../image/GIF/loader_anim.gif')} style={{ height: scaleHeight(250), width: scaleWidth(250) }} />
            //     </View>
            // </View>
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
        padding: scaleHeight(10)
        // paddingHorizontal: 20
    },
    terms: {
        fontSize: 20,
        color: 'black',
        fontWeight: '800',
        textAlign: 'center',
        marginVertical: 30,
        paddingHorizontal: scaleWidth(2.5)
    }
});