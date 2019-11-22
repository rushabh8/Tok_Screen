import React, { Component } from "react";
import {
  KeyboardAvoidingView,
  FlatList,
  AsyncStorage,
  Text,
  View,
  Dimensions,
  ImageBackground,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity
} from "react-native";
import styles from "../components/styles/styles";
import {
  scaleWidth,
  scaleHeight,
  normalizeFont
} from "../components/common/Responsive";
import webservice from "../webService/Api";
import { socket } from "../webService/global";
import Alert from "../screens/clubAlert";

const { width } = Dimensions.get("window");
const uncheck = require("../image/club/uncheck.png");
const check = require("../image/club/check.png");
const avatar = require("../image/create/default.png");

export default class friendListClub extends Component {
  disabled = false;
  constructor(props) {
    super(props);
    this.state = {
      offline: true,
      emptyAlert: false,
      userAlert: false,
      userId: "",
      countFriends: 1,
      clubName: "",
      selectedCount: null,
      selectedFriends: null,
      GroupName: null,
      selectedSubCategoryId: null,
      gamePlayType: ""
    };
  }

  componentDidMount() {
    this.setState({ isLoading: true });
    AsyncStorage.getItem("userId").then(resp =>
      this.setState({ userId: JSON.parse(resp) }, () => {
        this.getOnlineFriends();
      })
    );
    AsyncStorage.getItem("subCategoryId").then(resp =>
      this.setState({ selectedSubCategoryId: resp })
    );
    let { params } = this.props.navigation.state;
    this.setState({ gamePlayType: params.gamePlayType });
    // setTimeout(() => {
    //   this.getOnlineFriends();
    // }, 500);
  }

  getOnlineFriends() {
    socket.emit("get_online_friends", { userId: this.state.userId });
    this.setState({ isLoading: false });
    socket.on("receive_online_friends", data => {
      const dataOnline = data.data;
      for (let i in dataOnline) {
        if (dataOnline[i].userId.isOnline === "BUSY") {
          dataOnline[i].status = "Busy";
        }
      }
      this.setState({ onlineFriends: dataOnline, isLoading: false });
    });
  }

  _click(item, index) {
    let { onlineFriends } = this.state;
    onlineFriends[index].selected = !onlineFriends[index].selected;
    this.setState({ onlineFriends });
    let selectedCount = this.state.onlineFriends.filter(x => x.selected);
    this.setState({
      countFriends: selectedCount.length + 1,
      selectedFriends: selectedCount
    });
  }

  createClub() {
    if (this.disabled) return;
    this.disabled = true;
    setTimeout(() => {
      this.disabled = false;
    }, 500);

    if (this.state.clubName === "") {
      this.setState({ emptyAlert: true });
    } else if (this.state.countFriends == 1) {
      this.setState({ userAlert: true });
    } else if (this.state.countFriends != 1 && this.state.clubName != "") {
      this._createGameRoom();
    }
  }

  // ************************* create Game Room *****************************

  _createGameRoom() {
    this.setState({ isLoading: true });
    let { selectedFriends } = this.state;
    let selectedFriendsIds = [];
    selectedFriends.forEach(element => {
      selectedFriendsIds.push(element.userId._id);
    });

    let variables = {
      sendRequestBy: this.state.userId,
      gameType: this.state.gamePlayType,
      severity: "Easy",
      categoryId: this.state.selectedSubCategoryId,
      gameMode: "GROUP",
      sendRequestTo: selectedFriendsIds,
      groupName: this.state.clubName,
      admin: this.state.userId
    };
    return webservice(variables, "users/createGameRoomtop10", "POST").then(
      resp => {
        if (resp.data.responseCode === 200) {
          AsyncStorage.setItem(
            "gameRoomId",
            JSON.stringify(resp.data.data.gameId)
          );
          this.setState({ isLoading: false });
          this.props.navigation.navigate("GroupInfo", {
            data: { gamePlayType: this.state.gamePlayType }
          });
        }
      }
    );
  }

  render() {
    let textOutOf = "/10";
    let createText = "Create";
    return (
      <ImageBackground
        source={require("../image/Invite_friend/bg.png")}
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
          <View
            style={{
              marginHorizontal: scaleWidth(10),
              justifyContent: "space-between",
              width: width - scaleWidth(20),
              marginTop: scaleHeight(60),
              flexDirection: "row"
            }}
          >
            <Text
              style={{
                fontSize: normalizeFont(18),
                fontWeight: "bold",
                paddingVertical: scaleHeight(2.5),
                height: scaleHeight(40),
                width: scaleWidth(40)
              }}
            >
              {this.state.countFriends}
              {textOutOf}
            </Text>
            <TextInput
              allowFontScaling={false}
              autoCapitalize="none"
              maxLength={30}
              placeholderTextColor="gray"
              underlineColorAndroid="transparent"
              placeholder="Enter Club Name"
              returnKeyType="done"
              onChangeText={text => this.setState({ clubName: text })}
              style={{
                borderWidth: 1,
                borderRadius: 5,
                borderColor: "red",
                height: scaleHeight(40),
                alignItems: "center",
                paddingLeft: scaleWidth(10),
                backgroundColor: "#EEEEEE",
                width: width - scaleWidth(160),
                fontSize: normalizeFont(14),
                marginHorizontal: scaleWidth(10)
              }}
            />
            <TouchableOpacity onPress={() => this.createClub()}>
              <ImageBackground
                source={require("../image/welcome/Btn1.png")}
                style={{
                  height: scaleHeight(40),
                  width: scaleWidth(80),
                  borderRadius: 5,
                  justifyContent: "center",
                  alignItems: "center"
                }}
                resizeMode="stretch"
              >
                <Text
                  style={{
                    alignSelf: "center",
                    color: "white",
                    fontWeight: "800",
                    fontSize: normalizeFont(16)
                  }}
                >
                  {createText}
                </Text>
              </ImageBackground>
            </TouchableOpacity>
          </View>
          <ScrollView
            keyboardShouldPersistTaps="always"
            style={[styles.commonContainer, { paddingTop: scaleHeight(10) }]}
          >
            <FlatList
              style={{
                width: "100%",
                backgroundColor: "#F5F5F5",
                marginVertical: scaleHeight(15)
              }}
              data={this.state.onlineFriends}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  onPress={() => this._click(item, index)}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    borderBottomWidth: 2,
                    borderBottomColor: "lightgrey",
                    alignItems: "center",
                    backgroundColor: "white"
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginHorizontal: 10,
                      marginVertical: 10,
                      flex: 1
                    }}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Image
                        source={
                          item.userId.avatar !== null ||
                          item.userId.avatar === ""
                            ? { uri: item.userId.avatar }
                            : avatar
                        }
                        style={{
                          height: scaleHeight(45),
                          width: scaleWidth(45),
                          marginLeft: 10
                        }}
                      />
                      <View>
                        <Text
                          style={{
                            marginLeft: scaleWidth(12),
                            fontWeight: "bold",
                            fontSize: normalizeFont(20)
                          }}
                        >
                          {item.userId.name}
                        </Text>
                        <Text
                          style={{
                            marginLeft: scaleWidth(12),
                            fontSize: normalizeFont(12)
                          }}
                        >
                          {item.email}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => this._click(item, index)}>
                      <View>
                        {item.selected ? (
                          <Image
                            resizeMode="stretch"
                            source={check}
                            style={{
                              height: scaleHeight(18),
                              width: scaleWidth(18)
                            }}
                          />
                        ) : (
                          <Image
                            resizeMode="stretch"
                            source={uncheck}
                            style={{
                              height: scaleHeight(18),
                              width: scaleWidth(18)
                            }}
                          />
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) => index.toString()}
            />
          </ScrollView>
          <Alert
            onRequestClose={() => {
              this.setState({ emptyAlert: false });
            }}
            visible={this.state.emptyAlert}
            alertMessage="Please enter club name you"
            alertMessage1="want to create."
            cancelButton={() => {
              this.setState({ emptyAlert: false });
            }}
            buttonTitle="OK"
          />
          <Alert
            onRequestClose={() => {
              this.setState({ userAlert: false });
            }}
            visible={this.state.userAlert}
            alertMessage="Please select atleast one player"
            cancelButton={() => {
              this.setState({ userAlert: false });
            }}
            buttonTitle="OK"
          />
        </KeyboardAvoidingView>
      </ImageBackground>
    );
  }
}
