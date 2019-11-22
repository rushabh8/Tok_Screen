import React, { Component } from "react";
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
} from "react-native";
import TimerMixin from "react-timer-mixin";
import {
  scaleWidth,
  scaleHeight,
  normalizeFont
} from "../components/common/Responsive";
import { MusicFunc } from "../components/common/SoundFunc";
import { socket } from "../webService/global";
import Alert from "./profileModal";
import AnswerModal from "./answerModal";
import QuitModal from "./quitModal";
import webservice from "../webService/Api";
import Loader from "./loader";
import { userProfileData, otherUserProfileData } from "../webService/ApiStore";
import Textellipsis from "../components/common/Textellipsis";

const { width, height } = Dimensions.get("window");
const back = require("../image/BackIcon/back-icon.png");
const profileImage = require("../image/user.png");
const greyDot = require("../image/question/greyDot.png");
const redDot = require("../image/question/redDot.png");
const greenDot = require("../image/question/greenDot.png");
const GIF = require("../image/Smartshot/GIF.gif");
const red = require("../image/Smartshot/red.png");
const green = require("../image/Smartshot/green.png");
const blue = require("../image/Smartshot/blue.png");
const Question = require("../image/Gameplay_Screen/QuestionRow.png");

let correctAnswer;

export default class QuestionSmartSortDual extends Component {
  constructor(props) {
    super(props);
    this.state = {
      logoutModal: false,
      onCheckedAnswer: false,
      subCategoryId: null,
      questionArray: [],
      modalVisible: false,
      quitModal: false,
      selectedLanguage: "",
      gameType: "",
      index: 0,
      right: false,
      wrong: false,
      rightCount: 0,
      wrongCount: 0,
      selected: null,
      score1: 0,
      score2: 0,
      timeRemaining: 15,
      userId: "",
      otherUserId: "",
      name: "",
      otherName: "AMIT",
      country: "",
      state: "",
      win: "",
      lose: "",
      image1: "",
      image2: "",
      Avatar: null,
      isLoading: false,
      otherPlayerAnswer: null,
      connected: null,
      senderId: "",
      receiverId: "",
      playType: "",
      oneTimeClick: true,
      bothUserSelected: false,
      otherAns: false,
      otherUserSelected: "",
      otherSelected: false,
      isLoading: false,
      gameRoomId: "",
      show: false,
      show1: false,
      show2: false,
      ABCButton: [],
      ABCImage: GIF,
      winStatus: false,
      graphArray: [
        {
          Player1: [],
          Player2: []
        }
      ],
      bothPlayerReady: false,
      gamePlayType: "",
      myAnswer: ""
    };

    Mixins: [TimerMixin];
    this.animatedValue1 = new Animated.Value(0);
    this.animatedValue2 = new Animated.Value(0);
    this.animatedValue3 = new Animated.Value(0);
    this.animatedValue4 = new Animated.Value(0);
    this.animatedValue5 = new Animated.Value(0);
    this.animatedValue6 = new Animated.Value(0);
  }

  componentDidMount() {
    MusicFunc("Background_Music", "stop");
    this.setState({ isLoading: true });
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
    let playerReadyCount = 0,
      gameLeftCount = 0,
      scoreCount = 0;
    // ******************** get gameType ********************

    let type = this.props.navigation.state.params.data;
    this.setState({
      playType: type.playGameWith,
      image2: type.image2,
      senderId: type.senderId,
      receiverId: type.userId,
      otherUserId: type.userId,
      otherUserData: type.otherUserData,
      gamePlayType: this.props.navigation.state.params.gamePlayType
    });
    if (!this.state.playType === "friend" || "random")
      this.setState({ otherName: type.friendName });
    this.animate();

    // ******************** get userId ********************

    AsyncStorage.getItem("userId").then(id => {
      this.setState({ userId: JSON.parse(id) });
    });

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
      });
    }, 500);

    // ******************** get gameRoomId ********************

    AsyncStorage.getItem("gameRoomId").then(res => {
      this.setState({ gameRoomId: JSON.parse(res) });
    });

    // ******************** get subCategoryId ********************

    AsyncStorage.getItem("subCategoryId").then(id => {
      this.setState({ subCategoryId: id });
    });

    // ******************** get language ********************

    AsyncStorage.getItem("language").then(lang => {
      if (lang == null) this.setState({ selectedLanguage: "English" });
      else this.setState({ selectedLanguage: lang });
    });

    // ************************ Music Handling ****************

    setTimeout(() => {
      MusicFunc("Question_Appear_Music");
      this.setUserStatus();
      this.getQuestions();
    }, 1000);

    setTimeout(() => {
      MusicFunc("Option_Appear_Music");
    }, 2000);

    // Sockets Applied to get otherPlayer ANswer ******
    socket.on("player_ready", data => {
      if (playerReadyCount == 0) {
        this.setState({ bothPlayerReady: true, isLoading: false });
        setTimeout(() => {
          this.timer();
        }, 500);
        playerReadyCount = 1;
      }
    });

    socket.on("otherAnswer", data => {
      this.setState({
        bothUserSelected: true,
        otherUserSelected: data.otherPlayerAns
      });
      this.tick(data.otherPlayerAns);
    });

    socket.on("myScore", scoreData => {
      this.setState({
        score2: JSON.stringify(scoreData.other_player_score_new.currentScore)
      });

      // ~~~~~~~~~~~ store Graph Data ~~~~~~~~~~~~~~

      let temp = scoreData.scoreGameObj[this.state.receiverId].scoreArr;
      let count = 0;
      this.setState({ tempGraph: temp });
      if (this.state.index == 9) {
        if (count == 0) {
          count++;
          for (i in temp) {
            let graphData = {};
            graphData = {
              score2: temp[i].currentQuesScore,
              timeRemaining2: temp[i].timeRemaining
            };
            this.state.graphArray[0].Player2.push(graphData);
          }
        }
      }
    });

    socket.on("gameLeft", data => {
      if (gameLeftCount == 0) {
        gameLeftCount = 1;
        clearInterval(this.interval);
        socket.removeListener("otherAnswer");
        MusicFunc("Clock_Tik_Music", "stop");
        setTimeout(() => {
          Alert.alert("TOK", "Other Player left the game", [
            {
              text: "OK",
              onPress: () => {
                this.props.navigation.navigate("Home"),
                  this.setState({ index: 0 });
              }
            }
          ]);
        }, 100);
      }
    });

    setTimeout(() => {
      this.state.playType === "random" ? this.timer() : null;
      JSON.stringify(otherUserProfileData).length != 0
        ? this.ViewOtherPlayerProfile()
        : null;
    }, 500);
  }

  // ********************* handle Back Button **********************

  handleBackButton = () => {
    // ToastAndroid.show('You can not go back from this page using back button', ToastAndroid.SHORT);
    this.setState({ quitModal: true });
    return true;
  };

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  // ******************** start timer function ********************

  timer() {
    clearInterval(this.interval);
    setTimeout(() => {
      this.setState({ isLoading: false });
      setTimeout(() => {
        MusicFunc("Clock_Tik_Music", "play");
      }, 1000);
      if (this.state.timeRemaining !== 0)
        this.interval = setInterval(() => {
          this.tick();
        }, 1000);
    }, 3000);
  }

  // ******************** timer function ********************

  tick() {
    let { questionArray } = this.state;
    if (this.state.timeRemaining == 0 || this.state.bothUserSelected) {
      let checkAns = questionArray[this.state.index];
      let { ABCButton } = this.state;
      ABCButton = ["abc", "acb", "bca", "bac", "cba", "cab"];
      var randomElement = Math.floor(Math.random() * ABCButton.length);
      randomElement = randomElement.toString();
      let answer = ABCButton[randomElement];
      this.setState({ bothUserSelected: false });
      if (correctAnswer === answer) {
        checkAns.value = "green";
        MusicFunc("Right_Answer_Music");

        this.setState({
          ABCImage: green,
          questionArray,
          ABCButton: answer,
          show: true,
          show1: true,
          show2: true,
          right: true,
          oneTimeClick: false
        });
        this.updateScore(answer);
      } else {
        checkAns.value = "red";
        this.setState({
          ABCImage: red,
          questionArray,
          wrong: true,
          ABCButton: answer,
          show: true,
          show1: true,
          show2: true,
          oneTimeClick: false
        });
        this.updateScore(answer);
        MusicFunc("Wrong_Answer_Music");
        setTimeout(() => {
          this.setState({ ABCImage: green, ABCButton: correctAnswer });
        }, 500);
      }
      let selectAns = questionArray[this.state.index];
      selectAns.selectAnswer = answer;
      clearInterval(this.interval);
      setTimeout(() => {
        clearInterval(this.interval);
        this.nextQuestion();
      }, 1000);
      return;
      this.onCheckedAnswerByOther();
    } else {
      !this.state.onCheckedAnswer
        ? this.setState({
            timeRemaining: this.state.timeRemaining - 1,
            lock: false
          })
        : null;
      if (this.state.modalVisible == true) {
        var remainingTime = this.state.timeRemaining;
        this.setState({ remainingTime: remainingTime });
      }
    }
  }

  logoutModalOpen = visible => {
    this.setState({ logoutModal: !visible });
  };
  logoutModalClose = visible => {
    this.setState({ logoutModal: false });
  };

  // ************************* view OTHER USER profile *****************************

  ViewOtherPlayerProfile = () => {
    let variables = {
      userId: this.state.otherUserId
    };
    return webservice(variables, "users/viewProfile", "POST").then(resp => {
      if (resp.data.responseCode === 200) {
        otherUserProfile(resp.data.data[0]);
        this.setState({
          otherName: resp.data.data[0].name,
          image2: resp.data.data[0].avatar,
          country2: resp.data.data[0].country,
          state2: resp.data.data[0].state,
          win2: resp.data.data[0].win,
          lose2: resp.data.data[0].lose,
          myTopics2: resp.data.data[0].interests
        });
      }
    });
  };

  //  ******************** animation functions ********************

  animate() {
    this.animatedValue1.setValue(0);
    this.animatedValue2.setValue(0);
    this.animatedValue3.setValue(0);
    this.animatedValue4.setValue(0);
    this.animatedValue5.setValue(0);
    this.animatedValue6.setValue(0);
    const createAnimation = function(value, duration, easing, delay = 0) {
      return Animated.timing(value, {
        toValue: 1,
        duration,
        easing,
        delay
      });
    };
    Animated.parallel([
      createAnimation(this.animatedValue1, 2000, Easing.ease),
      createAnimation(this.animatedValue2, 1500, Easing.ease),
      createAnimation(this.animatedValue3, 1600, Easing.ease, 1600),
      createAnimation(this.animatedValue4, 1600, Easing.ease, 1600),
      createAnimation(this.animatedValue5, 2000, Easing.ease, 2000),
      createAnimation(this.animatedValue6, 2000, Easing.ease, 3000)
    ]).start();
  }

  // ************************* set user status false ****************************

  setUserStatus() {
    let variables = {
      _id: this.state.userId,
      status: "BUSY"
    };
    return webservice(variables, "users/onlineFalse", "POST").then(resp => {});
  }

  // ******************** get the questions using gameRoomId ********************

  getQuestions(id) {
    this.setState({ isLoading: true });
    let variables = {
      // "gameRoomId": this.state.gameRoomId
    };
    return webservice(
      variables,
      "topten/getSmartQuestionByRoomID",
      "POST"
    ).then(resp => {
      if (resp.data.responseCode === 200) {
        for (let i in resp.data.data) {
          resp.data.data[i]["selectAnswer"] = this.state.ABCButton;
        }
        this.setState({ questionArray: resp.data.data, isLoading: false });

        // emit socket "Ready"
        let readySocketData = {
          status: true,
          sentRequestBy: this.state.senderId,
          sentRequestTo: this.state.receiverId,
          gameRoomId: this.state.gameRoomId
        };
        socket.emit("playerStatus", readySocketData);
      } else if (resp.data.responseCode === 400) {
        this.setState({ isLoading: false });
        alert("400--" + resp.data.responseMessage);
      } else if (resp.data.responseCode === 1000) {
        alert(resp.data.responseMessage);
      }
    });
  }

  // ******************** check the selected Option ********************

  onCheckedOption(option) {
    if (option === "a") {
      this.setState({
        show: !this.state.show
      });
    } else if (option === "b") {
      this.setState({
        show1: !this.state.show1
      });
    } else if (option === "c") {
      this.setState({
        show2: !this.state.show2
      });
    }
    let { ABCButton } = this.state;
    if (ABCButton.length == 0) {
      ABCButton.push(option);
    } else {
      if (ABCButton[1] != option && ABCButton.length < 3) {
        ABCButton.push(option);
      }
    }
    this.setState({ ABCButton });
  }
  // ******************** check the selected Answer ********************

  onCheckedAnswer(qusId) {
    let { questionArray } = this.state;
    let checkAns = questionArray[this.state.index];
    let correctAnswer = questionArray[this.state.index].correctAnswer;
    MusicFunc("Clock_Tik_Music", "stop");
    if (this.state.playType === "friend") {
      if (this.state.oneTimeClick) {
        let socket_req = {
          gameId: this.state.gameRoomId,
          question_Id: qusId,
          correctAnswer: answer,
          sentRequestBy: this.state.senderId,
          sentRequestTo: this.state.receiverId
        };
        socket.emit("otherAnswer", socket_req);
        let { ABCButton } = this.state;
        let answer = ABCButton.join("");
        if (ABCButton.length < 3) {
          alert("Please select all fields.");
        } else {
          if (correctAnswer === answer) {
            checkAns.value = "green";
            MusicFunc("Right_Answer_Music");
            this.setState({
              ABCImage: green,
              questionArray,
              right: true,
              oneTimeClick: false
            });
            this.updateScore(answer, qusId);
          } else {
            checkAns.value = "red";
            this.setState({
              ABCImage: red,
              questionArray,
              wrong: true,
              oneTimeClick: false
            });
            this.updateScore(answer, qusId);
            MusicFunc("Wrong_Answer_Music");
            setTimeout(() => {
              this.setState({ ABCImage: green, ABCButton: correctAnswer });
            }, 1000);
          }

          clearInterval(this.interval);
          setTimeout(() => {
            this.nextQuestion();
          }, 1000);
          let { questionArray } = this.state;
          let selectAns = questionArray[this.state.index];
          selectAns.selectAnswer = answer;
          this.setState({ questionArray });
        }
      }
    } else {
      this.setState({ lock: true });
      if (this.state.oneTimeClick) {
        let { ABCButton } = this.state;
        let answer = ABCButton.join("");
        if (ABCButton.length < 3) {
          alert("please select all fields.");
        } else {
          if (correctAnswer === answer) {
            checkAns.value = "green";
            MusicFunc("Right_Answer_Music");
            this.setState({
              ABCImage: green,
              right: true,
              oneTimeClick: false
            });
            this.updateScore(answer, qusId);
          } else {
            checkAns.value = "red";
            this.setState({ ABCImage: red, wrong: true, oneTimeClick: false });
            this.updateScore(answer, qusId);
            MusicFunc("Wrong_Answer_Music");
            setTimeout(() => {
              this.setState({ ABCImage: green, ABCButton: correctAnswer });
            }, 1000);
          }
          clearInterval(this.interval);
          setTimeout(() => {
            this.nextQuestion();
          }, 3000);

          this.onCheckedAnswerByOther();
          let { questionArray } = this.state;
          let selectAns = questionArray[this.state.index];
          selectAns.selectAnswer = answer;
          this.setState({ questionArray });
        }
      }
    }
  }

  onCheckedAnswerByOther() {
    let { questionArray } = this.state;
    var items = ["abc", "acb", "bca", "bac", "cba", "cab"];
    var randomElement = Math.floor(Math.random() * items.length);
    randomElement = randomElement.toString();
    let checkAns = questionArray[this.state.index];
    let correctAnswer = questionArray[this.state.index].correctAnswer;
    let otherPlayerAnswer = items[randomElement];
    if (correctAnswer === otherPlayerAnswer) {
      checkAns.valueOther = "green";
      MusicFunc("Right_Answer_Music");
      this.updateScoreOther(otherPlayerAnswer);
      clearInterval(this.interval);
    } else {
      checkAns.valueOther = "red";
      this.updateScoreOther(otherPlayerAnswer);
      MusicFunc("Wrong_Answer_Music");
      clearInterval(this.interval);
    }
    let selectAns = questionArray[this.state.index];
    selectAns.selectAnswer = otherPlayerAnswer;
  }

  // ******************** update score ********************

  updateScore(answer, qusId) {
    if (answer === correctAnswer) {
      this.setState({
        score1: this.state.score1 + 10 + this.state.timeRemaining,
        rightCount: this.state.rightCount + 1
      });
    } else {
      this.setState({ wrongCount: this.state.wrongCount + 1 });
    }

    // ~~~~~~~~~~~ store Graph Data ~~~~~~~~~~~~~~

    let graphData = {};
    graphData = {
      score1: answer === correctAnswer ? 10 : 0,
      timeRemaining1: this.state.timeRemaining
    };
    this.state.graphArray[0].Player1.push(graphData);
    setTimeout(() => {
      scoreObj = {
        gameId: this.state.gameRoomId,
        questionId: qusId,
        myScore: this.state.score1,
        sentRequestBy: this.state.senderId,
        sentRequestTo: this.state.receiverId
      };
      this.state.playType === "friend"
        ? socket.emit("myScore", scoreObj)
        : null;
    }, 500);
  }

  // ******************** update score other player ********************

  updateScoreOther(answer) {
    if (answer === correctAnswer) {
      setTimeout(() => {
        this.setState({
          score2: this.state.score2 + 10 + this.state.timeRemaining
        });
      }, 300);
    }

    // ~~~~~~~~~~ generate Random time in case of Random mode ~~~~~~~~~
    let timeArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    let timeRemaining2 = Math.floor(Math.random() * timeArray.length);

    // ~~~~~~~~~~~ store Graph Data ~~~~~~~~~~~~~~

    let graphData = {};
    graphData = {
      score2: answer === correctAnswer ? 10 : 0,
      timeRemaining2:
        this.state.gameType === "friend"
          ? this.state.timeRemaining
          : timeRemaining2
    };

    this.state.graphArray[0].Player2.push(graphData);
  }

  answerModalClose() {
    this.setState({ modalVisible: false });
  }

  // ******************** Display next question ********************

  nextQuestion() {
    this.setState({
      ABCImage: GIF,
      modalVisible: false,
      oneTimeClick: true,
      otherAns: false,
      otherSelected: false,
      show: false,
      show1: false,
      show2: false,
      ABCButton: [],
      right: false,
      wrong: false
    });
    let { index, questionArray } = this.state,
      gameCompleteCount = 0;
    index++;
    if (index <= questionArray.length - 1) {
      this.setState({ index });
      this.timer();
      setTimeout(() => {
        MusicFunc("Question_Appear_Music");
      }, 1000);
      setTimeout(() => {
        MusicFunc("Option_Appear_Music");
      }, 2000);
    } else {
      gameCompleteCount = 1;
      if (gameCompleteCount == 1) {
        this.setState({ isLoading: true });
        clearInterval(this.interval);
        this._gameResults();
        gameCompleteCount = 2;
      }
    }
    this.setState({ selected: null, timeRemaining: 15 });
    this.animate();
  }

  // ********************* game Results (win/lose) *************************

  _gameResults() {
    if (this.state.score1 >= this.state.score2) {
      this.setState({ winStatus: true });
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
      gameType: this.state.playType,
      otherUserId: this.state.otherUserId,
      graphArray: this.state.graphArray,
      winStatus: this.state.winStatus
    };

    setTimeout(() => {
      socket.removeListener("otherAnswer");
      socket.removeListener("myScore");
      socket.removeAllListeners([
        "otherAnswer",
        "gameLeft",
        "myScore",
        "player_ready"
      ]);
      this.setState({ lock: false, isLoading: false });
      this.props.navigation.navigate("Result", { gameObj: gameObj });
    }, 500);
  }

  // ******************** Quit Game ********************

  _quitGame() {
    clearInterval(this.interval);
    MusicFunc("Clock_Tik_Music", "stop");
    this.setState({ quitModal: false });
    var gameLeftObj = {
      sentRequestBy: this.state.senderId,
      sentRequestTo: this.state.receiverId,
      gameRoomId: this.state.gameRoomId
    };
    socket.emit("gameLeft", gameLeftObj);
    this.props.navigation.navigate("Home");
  }
  onDeleteOption() {
    this.setState({
      show: false,
      show1: false,
      show2: false,
      ABCButton: []
    });
  }

  resize() {
    let { index, questionArray, selectedLanguage } = this.state;
    let lang = selectedLanguage.toLowerCase();
    let Options = { ...questionArray[index][lang] };
    delete Options["question"];
    if (Options) {
      for (let item in Options) {
        item.length > 25 ? true : false;
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
    let { index, questionArray } = this.state;
    if (
      questionArray[index].english.question.length > 170 ||
      questionArray[index].hindi.b.length > 170
    ) {
      return "yes";
    } else {
      return "no";
    }
  }

  render() {
    const introButton = this.animatedValue1.interpolate({
      inputRange: [0, 1],
      outputRange: [-500, 10]
    });
    const introButton1 = this.animatedValue2.interpolate({
      inputRange: [0, 1],
      outputRange: [-500, 1]
    });
    const centerImage = this.animatedValue3.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 0, 1]
    });
    const introButton2 = this.animatedValue4.interpolate({
      inputRange: [0, 1],
      outputRange: [-500, 1]
    });
    const introButton3 = this.animatedValue5.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [-500, 350, 100]
    });
    const introButton4 = this.animatedValue6.interpolate({
      inputRange: [0, 1],
      outputRange: [500, 0]
    });

    let {
      ABCImage,
      questionArray,
      index,
      selectedLanguage,
      right,
      wrong,
      score1,
      otherAns,
      otherUserSelected,
      score2,
      show,
      show1,
      show2,
      otherSelected,
      selected
    } = this.state;
    if (this.state.questionArray.length > 0) {
      if (selectedLanguage == "English") {
        questionList = questionArray[index].english;
        correctAnswer = questionArray[index].correctAnswer;
        selectAnswer = questionArray[index].selectAnswer;
      } else if (selectedLanguage == "Hindi") {
        questionList = questionArray[index].hindi;
        correctAnswer = questionArray[index].correctAnswer;
        selectAnswer = questionArray[index].selectAnswer;
      }
    }

    return this.state.questionArray.length > 0 ? (
      <ImageBackground
        source={require("../image/Gameplay_Screen/bg.png")}
        style={{ flex: 1 }}
        resizeMode="stretch"
      >
        <Loader visible={this.state.isLoading} />
        <View style={{ flexDirection: "row", paddingTop: scaleHeight(10) }}>
          <TouchableOpacity onPress={() => this.setState({ quitModal: true })}>
            <Image
              source={back}
              style={{ width: scaleWidth(25), height: scaleHeight(25) }}
            />
          </TouchableOpacity>
          <View
            style={{
              flexDirection: "row",
              flex: 1,
              justifyContent: "space-between",
              paddingHorizontal: scaleWidth(20)
            }}
          >
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: normalizeFont(18), textAlign: "left" }}>
                <Textellipsis mytextvar={this.state.name} maxlimit={15} />
              </Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: normalizeFont(18), textAlign: "right" }}>
                <Textellipsis mytextvar={this.state.otherName} maxlimit={15} />
              </Text>
            </View>
          </View>
        </View>

        <QuitModal
          visible={this.state.quitModal}
          message="Are you sure you want to quit game?"
          No={() => this.setState({ quitModal: false })}
          Yes={() => {
            this.setState({ quitModal: false });
            this.props.navigation.navigate("Home");
            clearInterval(this.interval);
          }}
        />

        <View style={styles.termsContainer}>
          <View style={{ flexDirection: "row", paddingTop: scaleHeight(5) }}>
            <View
              style={{
                shadowColor: "black",
                shadowOffset: { width: 2, height: 2 },
                shadowOpacity: 0.5,
                shadowRadius: 1
              }}
            >
              <Image
                source={
                  this.state.image1 ? { uri: this.state.image1 } : profileImage
                }
                style={{
                  width: scaleWidth(80),
                  height: scaleHeight(80),
                  borderRadius: 10,
                  borderColor: "white",
                  borderWidth: 5,
                  paddingVertical: 12
                }}
                resizeMode="stretch"
              />
            </View>
            <ImageBackground
              source={require("../image/Gameplay/Bluescroce.png")}
              style={{ alignSelf: "center", left: scaleWidth(5) }}
            >
              <Text style={{ color: "white", padding: 7, textAlign: "center" }}>
                {score1}
              </Text>
            </ImageBackground>
          </View>

          <ImageBackground
            source={require("../image/Gameplay/score.png")}
            resizeMode="stretch"
            style={{
              height: scaleHeight(30),
              width: scaleWidth(40),
              alignSelf: "center",
              justifyContent: "center",
              alignItems: "center",
              transform: [{ rotate: "179deg" }]
            }}
          >
            <Text
              style={{
                fontSize: 18,
                color: "#fff",
                fontWeight: "bold",
                textAlign: "center"
              }}
            />
          </ImageBackground>

          <ImageBackground
            source={require("../image/Gameplay/clock.png")}
            resizeMode="stretch"
            style={{
              height: scaleHeight(60),
              width: scaleWidth(50),
              alignSelf: "flex-start",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Text
              style={{
                fontSize: 18,
                color: "#fff",
                fontWeight: "bold",
                textAlign: "center"
              }}
            >
              {this.state.timeRemaining}
            </Text>
          </ImageBackground>

          <ImageBackground
            source={require("../image/Gameplay/score.png")}
            resizeMode="stretch"
            style={{
              height: scaleHeight(30),
              width: scaleWidth(40),
              alignSelf: "center",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Text
              style={{
                fontSize: 18,
                color: "#fff",
                fontWeight: "bold",
                textAlign: "center"
              }}
            />
          </ImageBackground>

          <View style={{ flexDirection: "row", paddingTop: scaleHeight(5) }}>
            <ImageBackground
              source={require("../image/Gameplay/Orangescore.png")}
              style={{ alignSelf: "center", right: scaleWidth(5) }}
            >
              <Text style={{ color: "white", padding: 7, textAlign: "center" }}>
                {score2}
              </Text>
            </ImageBackground>
            <TouchableOpacity
              onPress={() => {
                this.logoutModalOpen();
              }}
              style={{
                shadowColor: "black",
                shadowOffset: { width: 2, height: 2 },
                shadowOpacity: 0.5,
                shadowRadius: 1
              }}
            >
              <Image
                source={
                  this.state.image2 ? { uri: this.state.image2 } : profileImage
                }
                style={{
                  width: scaleWidth(80),
                  height: scaleHeight(80),
                  borderRadius: 10,
                  borderColor: "white",
                  borderWidth: 5,
                  paddingVertical: 12
                }}
                resizeMode="stretch"
              />
            </TouchableOpacity>
          </View>
        </View>
        <Image
          source={require("../image/Gameplay/line.png")}
          style={{ width }}
        />
        {/* <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image source={questionArray[0].value == 'green' ? greenDot : questionArray[0].value == 'red' ? redDot : greyDot} style={{ left: 1, marginHorizontal: scaleWidth(25) }} />
                        <Image source={questionArray[1].value == 'green' ? greenDot : questionArray[1].value == 'red' ? redDot : greyDot} style={{ marginRight: scaleWidth(25) }} />
                        <Image source={questionArray[2].value == 'green' ? greenDot : questionArray[2].value == 'red' ? redDot : greyDot} style={{ marginRight: scaleWidth(25) }} />
                        <View style={{ left: scaleWidth(27) }} >
                            <Image source={require('../image/Gameplay/Questtion.png')} style={{ zIndex: 0, position: 'relative' }} resizeMode='stretch' />
                            <Text style={{
                                zIndex: 1, position: 'absolute', alignSelf: 'center',
                                top: Platform.OS == 'ios' ? scaleHeight(3) : scaleHeight(2), color: 'white', fontWeight: '600', fontSize: normalizeFont(17)
                            }}>Q. {index + 1}</Text>
                        </View>
                        <Image source={questionArray[2].valueOther == 'green' ? greenDot : questionArray[2].valueOther == 'red' ? redDot : greyDot} resizeMode='stretch' style={{ left: 1, marginLeft: scaleWidth(75), marginRight: scaleWidth(25) }} />
                        <Image source={questionArray[1].valueOther == 'green' ? greenDot : questionArray[1].valueOther == 'red' ? redDot : greyDot} resizeMode='stretch' style={{ marginRight: scaleWidth(25) }} />
                        <Image source={questionArray[0].valueOther == 'green' ? greenDot : questionArray[0].valueOther == 'red' ? redDot : greyDot} resizeMode='stretch' style={{ marginRight: scaleWidth(25) }} />
                    </View> */}

        <View style={{ flexDirection: "row", alignItems: "center", width }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              flex: 3,
              marginLeft: scaleWidth(7.5),
              marginRight: scaleWidth(40)
            }}
          >
            <Image
              source={
                questionArray[0].value == "green"
                  ? greenDot
                  : questionArray[0].value == "red"
                  ? redDot
                  : greyDot
              }
              style={{ marginHorizontal: scaleWidth(5) }}
            />
            <Image
              source={
                questionArray[1].value == "green"
                  ? greenDot
                  : questionArray[1].value == "red"
                  ? redDot
                  : greyDot
              }
              style={{ marginHorizontal: scaleWidth(5) }}
            />
            <Image
              source={
                questionArray[2].value == "green"
                  ? greenDot
                  : questionArray[2].value == "red"
                  ? redDot
                  : greyDot
              }
              style={{ marginHorizontal: scaleWidth(5) }}
            />
          </View>
          <View style={{ justifyContent: "center" }}>
            <ImageBackground
              source={require("../image/Gameplay/Questtion.png")}
              style={{ alignItems: "center", paddingHorizontal: scaleWidth(5) }}
              resizeMode="stretch"
            >
              <Text
                style={{
                  color: "white",
                  fontWeight: "600",
                  fontSize: normalizeFont(17)
                }}
              >
                Q. {index + 1}
              </Text>
            </ImageBackground>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              flex: 3,
              marginRight: scaleWidth(7.5),
              marginLeft: scaleWidth(40)
            }}
          >
            <Image
              source={
                questionArray[2].valueOther == "green"
                  ? greenDot
                  : questionArray[2].valueOther == "red"
                  ? redDot
                  : greyDot
              }
              resizeMode="stretch"
              style={{ marginHorizontal: scaleWidth(5) }}
            />
            <Image
              source={
                questionArray[1].valueOther == "green"
                  ? greenDot
                  : questionArray[1].valueOther == "red"
                  ? redDot
                  : greyDot
              }
              resizeMode="stretch"
              style={{ marginHorizontal: scaleWidth(5) }}
            />
            <Image
              source={
                questionArray[0].valueOther == "green"
                  ? greenDot
                  : questionArray[0].valueOther == "red"
                  ? redDot
                  : greyDot
              }
              resizeMode="stretch"
              style={{ marginHorizontal: scaleWidth(5) }}
            />
          </View>
        </View>
        <Animated.Text
          style={{
            backgroundColor: "transparent",
            width: width - scaleWidth(20),
            flexWrap: "wrap",
            left: introButton
          }}
        >
          <Text
            style={[
              styles.terms,
              {
                fontSize:
                  this.resizeQues() == "yes"
                    ? normalizeFont(16)
                    : normalizeFont(20)
              }
            ]}
          >
            {questionList.question}
          </Text>
        </Animated.Text>

        {/* ///////////////////////////////////// 1st button //////////////////////////////////////////*/}
        {show ? (
          <View
            style={{
              backgroundColor: "transparent",
              height: Platform.OS == "ios" ? scaleHeight(55) : scaleHeight(55),
              marginTop: scaleHeight(10)
            }}
          >
            <Image
              source={require("../image/Smartshot/dots.png")}
              style={{ width: "100%" }}
              resizeMode="stretch"
            />
            <View
              source={wrong ? Question : blue}
              style={{
                width: "100%",
                height: scaleHeight(45),
                backgroundColor: "#03B1CF"
              }}
            >
              <Image
                source={require("../image/Smartshot/purple.png")}
                style={{
                  width: "100%",
                  height: 48,
                  bottom: 4,
                  marginLeft: "-85%"
                }}
                resizeMode="stretch"
              />
              <Text
                style={{
                  color: "white",
                  fontWeight: "800",
                  fontSize: normalizeFont(19),
                  zIndex: 1,
                  position: "absolute",
                  top: 7,
                  left: 15
                }}
              >
                A
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  zIndex: 1,
                  position: "absolute",
                  top: scaleHeight(10),
                  color: "white",
                  textAlign: "center",
                  fontWeight: "800",
                  fontSize: normalizeFont(19),
                  left: width / 2 - 35
                }}
              >
                {questionList.a}
              </Text>
            </View>
            <Image
              source={require("../image/Smartshot/dots.png")}
              style={{ width: "100%" }}
              resizeMode="stretch"
            />
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => this.onCheckedOption("a")}
            style={{
              backgroundColor: "transparent",
              height: Platform.OS == "ios" ? scaleHeight(55) : scaleHeight(55),
              marginTop: scaleHeight(10)
            }}
          >
            <Animated.View style={{ left: introButton2, position: "relative" }}>
              <Animated.Image
                source={require("../image/Smartshot/dots.png")}
                style={{
                  top: 5,
                  position: "relative",
                  zIndex: 1,
                  left: introButton1,
                  width: "100%"
                }}
                resizeMode="stretch"
              />
              <Animated.View
                style={{
                  width: width + 50,
                  height: scaleHeight(55),
                  backgroundColor: "#BC1D7A",
                  transform: [{ scale: centerImage }],
                  position: "relative"
                }}
              />
              <Animated.Image
                source={require("../image/Smartshot/dots.png")}
                style={{
                  bottom: 9,
                  position: "relative",
                  zIndex: 1,
                  left: introButton1,
                  width: "100%"
                }}
                resizeMode="stretch"
              />
            </Animated.View>
            <Animated.View
              style={{
                left: introButton3,
                transform: [{ translateX: -(width + 40) }],
                position: "relative",
                zIndex: 2,
                bottom: Platform.OS == "ios" ? 54 : 54
              }}
            >
              <Image
                source={require("../image/Smartshot/purple.png")}
                style={{ width: "100%", height: 48, bottom: 4 }}
                resizeMode="stretch"
              />
              <Text
                style={{
                  color: "white",
                  fontWeight: "800",
                  fontSize: normalizeFont(19),
                  zIndex: 1,
                  position: "absolute",
                  top: 7,
                  right: 35
                }}
              >
                A
              </Text>
            </Animated.View>
            <Animated.Text
              style={{
                left: introButton4,
                color: "white",
                marginLeft: scaleWidth(15),
                fontWeight: "800",
                fontSize: normalizeFont(19),
                marginTop: scaleHeight(5),
                bottom: Platform.OS == "ios" ? 95 : 95,
                textAlign: "center",
                alignSelf: "center"
              }}
            >
              {questionList.a}
            </Animated.Text>
          </TouchableOpacity>
        )}

        {/* ///////////////////////////////////// 2nd button //////////////////////////////////////////*/}
        {show1 ? (
          <View
            style={{
              backgroundColor: "transparent",
              height: Platform.OS == "ios" ? scaleHeight(55) : scaleHeight(55),
              marginTop: scaleHeight(10)
            }}
          >
            <Image
              source={require("../image/Smartshot/dots.png")}
              style={{ width: "100%" }}
              resizeMode="stretch"
            />
            <View
              source={wrong ? Question : blue}
              style={{
                width: "100%",
                height: scaleHeight(45),
                backgroundColor: "#03B1CF"
              }}
            >
              <Image
                source={require("../image/Smartshot/purple.png")}
                style={{
                  width: "100%",
                  height: 48,
                  bottom: 4,
                  marginLeft: "-85%"
                }}
                resizeMode="stretch"
              />
              <Text
                style={{
                  color: "white",
                  fontWeight: "800",
                  fontSize: normalizeFont(19),
                  zIndex: 1,
                  position: "absolute",
                  top: 7,
                  left: 15
                }}
              >
                B
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  zIndex: 1,
                  position: "absolute",
                  top: 7,
                  color: "white",

                  fontWeight: "800",
                  fontSize: normalizeFont(19),
                  left: width / 2 - 35
                }}
              >
                {questionList.b}
              </Text>
            </View>
            <Image
              source={require("../image/Smartshot/dots.png")}
              style={{ width: "100%" }}
              resizeMode="stretch"
            />
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => this.onCheckedOption("b")}
            style={{
              backgroundColor: "transparent",
              height: Platform.OS == "ios" ? scaleHeight(55) : scaleHeight(55),
              marginTop: scaleHeight(10)
            }}
          >
            <Animated.View style={{ left: introButton2, position: "relative" }}>
              <Animated.Image
                source={require("../image/Smartshot/dots.png")}
                style={{
                  top: 5,
                  position: "relative",
                  zIndex: 1,
                  left: introButton1,
                  width: "100%"
                }}
                resizeMode="stretch"
              />
              <Animated.View
                style={{
                  width: width + 50,
                  height: scaleHeight(55),
                  backgroundColor: "#BC1D7A",
                  transform: [{ scale: centerImage }],
                  position: "relative"
                }}
              />
              <Animated.Image
                source={require("../image/Smartshot/dots.png")}
                style={{
                  bottom: 9,
                  position: "relative",
                  zIndex: 1,
                  left: introButton1,
                  width: "100%"
                }}
                resizeMode="stretch"
              />
            </Animated.View>
            <Animated.View
              style={{
                left: introButton3,
                transform: [{ translateX: -(width + 40) }],
                position: "relative",
                zIndex: 2,
                bottom: Platform.OS == "ios" ? 54 : 54
              }}
            >
              <Image
                source={require("../image/Smartshot/purple.png")}
                style={{ width: "100%", height: 48, bottom: 4 }}
                resizeMode="stretch"
              />
              <Text
                style={{
                  color: "white",
                  fontWeight: "800",
                  fontSize: normalizeFont(19),
                  textAlign: "center",
                  zIndex: 1,
                  position: "absolute",
                  top: 7,
                  right: 35
                }}
              >
                B
              </Text>
            </Animated.View>
            <Animated.Text
              style={{
                left: introButton4,
                color: "white",
                marginLeft: scaleWidth(15),
                fontWeight: "800",
                fontSize: normalizeFont(19),
                marginTop: scaleHeight(5),
                bottom: Platform.OS == "ios" ? 95 : 95,
                textAlign: "center",
                alignSelf: "center"
              }}
            >
              {questionList.b}
            </Animated.Text>
          </TouchableOpacity>
        )}
        {/* ///////////////////////////////////// 3rd button //////////////////////////////////////////*/}
        {show2 ? (
          <View
            style={{
              backgroundColor: "transparent",
              height: Platform.OS == "ios" ? scaleHeight(55) : scaleHeight(55),
              marginTop: scaleHeight(10)
            }}
          >
            <Image
              source={require("../image/Smartshot/dots.png")}
              style={{ width: "100%" }}
              resizeMode="stretch"
            />
            <View
              source={wrong ? Question : blue}
              style={{
                width: "100%",
                height: scaleHeight(45),
                backgroundColor: "#03B1CF"
              }}
            >
              <Image
                source={require("../image/Smartshot/purple.png")}
                style={{
                  width: "100%",
                  height: 48,
                  bottom: 4,
                  marginLeft: "-85%"
                }}
                resizeMode="stretch"
              />
              <Text
                style={{
                  color: "white",
                  fontWeight: "800",
                  fontSize: normalizeFont(19),
                  zIndex: 1,
                  position: "absolute",
                  top: 7,
                  left: 15
                }}
              >
                C
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  zIndex: 1,
                  position: "absolute",
                  top: 7,
                  color: "white",
                  fontWeight: "800",
                  fontSize: normalizeFont(19),
                  left: width / 2 - 35
                }}
              >
                {questionList.c}
              </Text>
            </View>
            <Image
              source={require("../image/Smartshot/dots.png")}
              style={{ width: "100%" }}
              resizeMode="stretch"
            />
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => this.onCheckedOption("c")}
            style={{
              backgroundColor: "transparent",
              height: Platform.OS == "ios" ? scaleHeight(55) : scaleHeight(55),
              marginTop: scaleHeight(10)
            }}
          >
            <Animated.View style={{ left: introButton2, position: "relative" }}>
              <Animated.Image
                source={require("../image/Smartshot/dots.png")}
                style={{
                  top: 5,
                  position: "relative",
                  zIndex: 1,
                  left: introButton1,
                  width: "100%"
                }}
                resizeMode="stretch"
              />
              <Animated.View
                style={{
                  width: width + 50,
                  height: scaleHeight(55),
                  backgroundColor: "#BC1D7A",
                  transform: [{ scale: centerImage }],
                  position: "relative"
                }}
              />
              <Animated.Image
                source={require("../image/Smartshot/dots.png")}
                style={{
                  bottom: 9,
                  position: "relative",
                  zIndex: 1,
                  left: introButton1,
                  width: "100%"
                }}
                resizeMode="stretch"
              />
            </Animated.View>
            <Animated.View
              style={{
                left: introButton3,
                transform: [{ translateX: -(width + 40) }],
                position: "relative",
                zIndex: 2,
                bottom: Platform.OS == "ios" ? 54 : 54
              }}
            >
              <Image
                source={require("../image/Smartshot/purple.png")}
                style={{ width: "100%", height: 48, bottom: 4 }}
                resizeMode="stretch"
              />
              <Text
                style={{
                  color: "white",
                  fontWeight: "800",
                  fontSize: normalizeFont(19),
                  textAlign: "center",
                  zIndex: 1,
                  position: "absolute",
                  top: 7,
                  right: 35
                }}
              >
                C
              </Text>
            </Animated.View>
            <Animated.Text
              style={{
                left: introButton4,
                color: "white",
                marginLeft: scaleWidth(15),
                fontWeight: "800",
                fontSize: normalizeFont(19),
                marginTop: scaleHeight(5),
                bottom: Platform.OS == "ios" ? 95 : 95,
                textAlign: "center",
                alignSelf: "center"
              }}
            >
              {questionList.c}
            </Animated.Text>
          </TouchableOpacity>
        )}
        {/* ///////////////////////////////////// A, B, C button //////////////////////////////////////////*/}
        <View
          style={{
            backgroundColor: "transparent",
            justifyContent: "center",
            alignItems: "center",
            height: scaleHeight(55)
          }}
        >
          <FlatList
            horizontal
            data={this.state.ABCButton}
            extraData={this.state}
            renderItem={({ item }) => (
              <View
                style={{
                  justifyContent: "space-between",
                  alignItems: "center",
                  right: scaleWidth(10)
                }}
              >
                <Image
                  source={ABCImage}
                  resizeMode="center"
                  style={{ height: scaleHeight(50), width: scaleWidth(60) }}
                />
                <Text
                  style={{
                    color: "white",
                    fontWeight: "800",
                    fontSize: normalizeFont(19),
                    zIndex: 1,
                    position: "absolute",
                    alignSelf: "center",
                    top: scaleHeight(10)
                  }}
                >
                  {item.toUpperCase()}
                </Text>
              </View>
            )}
          />
        </View>
        {/* /////////////////////////////////// submit and delete button ////////////////////////////////// */}
        <View
          style={{
            backgroundColor: "transparent",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            height: 50,
            marginTop: Platform.OS == "ios" ? -10 : -10
          }}
        >
          <TouchableOpacity
            style={{ marginHorizontal: 15 }}
            onPress={() => this.onCheckedAnswer()}
          >
            <Image
              source={require("../image/Gameplay_Screen/Submit.png")}
              style={{}}
              resizeMode="stretch"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={{ marginHorizontal: 15 }}
            onPress={() => this.onDeleteOption()}
          >
            <Image
              source={require("../image/Gameplay_Screen/DELETE.png")}
              style={{}}
              resizeMode="stretch"
            />
          </TouchableOpacity>
        </View>
        <AnswerModal
          visible={this.state.modalVisible}
          answerModalClose={() => this.answerModalClose()}
          explanation={questionList.explanation}
          Next={() => {
            this.nextQuestion(), MusicFunc("Button_Click_Music");
          }}
          title="Next"
        />
      </ImageBackground>
    ) : (
      <Loader visible={this.state.isLoading} />
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF"
  },
  termsContainer: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  terms: {
    fontSize: normalizeFont(17),
    color: "black",
    fontWeight: "800",
    textAlign: "center",
    marginVertical: 30,
    marginHorizontal: scaleWidth(15),
    width: width - scaleWidth(30)
  }
});
