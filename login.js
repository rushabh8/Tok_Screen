import React, { Component } from "react";
import {
  AsyncStorage,
  KeyboardAvoidingView,
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
import { MusicFunc } from "../components/common/SoundFunc";
import webservice from "../webService/Api";
import { userProfile } from "../webService/ApiStore";
import { initUser } from "../webService/global";
import Loader from "./loader";
import { validateEmail, validatePassword } from "./validation";
import Alert from "./clubAlert";

const { width, height } = Dimensions.get("window");

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      closeAlert: false,
      message: "",
      userLoggedIn: false,
      email: "",
      password: "",
      emailCheck: "",
      passwordCheck: "",
      check: false,
      isLoading: false,
      isAvatar: false,
      token: "",
      apiFailed: false,
      failureAlertTitle: "",
      failureAlertMessage: ""
    };
    this.emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,3}))$/;
  }

  componentDidMount() {
    AsyncStorage.getItem("token").then(res => {
      let token = JSON.parse(res);
      this.setState({ token: token });
    });
    AsyncStorage.getItem("avatar").then(res =>
      this.setState({ isAvatar: res })
    );
  }

  getEmail(text) {
    this.setState({
      email: text,
      emailCheck: ""
    });
  }

  createAccount() {
    this.props.navigation.navigate("CreateAccount");
  }

  getPassword(text) {
    this.setState({
      password: text,
      passwordCheck: ""
    });
  }

  _validate() {
    if (validateEmail(this.state.email).status) {
      if (validatePassword(this.state.password).status) {
        this.submit();
      } else {
        this.setState({
          closeAlert: true,
          message: validatePassword(this.state.password).error
        });
      }
    } else {
      this.setState({
        closeAlert: true,
        message: validateEmail(this.state.email).error
      });
    }
  }

  submit() {
    MusicFunc("Button_Click_Music");
    this.setState({ isLoading: true });
    let variables = {
      email: this.state.email,
      password: this.state.password
    };
    return webservice(variables, "users/login", "POST").then(resp => {
      this.setState({ isLoading: false });
      if (resp.data.responseCode === 200) {
        AsyncStorage.setItem("userId", JSON.stringify(resp.data.data[0]._id));
        AsyncStorage.setItem("name", JSON.stringify(resp.data.data[0].name));
        AsyncStorage.setItem("email", JSON.stringify(resp.data.data[0].email));
        AsyncStorage.setItem(
          "interests",
          JSON.stringify(resp.data.data[0].interests)
        );
        AsyncStorage.setItem("loginState", JSON.stringify(true));

        // Api store user Proile
        userProfile(resp.data.data[0]);

        // Socket user initialization
        initUser(resp.data.data[0]._id, resp.data.data[0].name);

        this._checkAvatar(resp.data.data[0]._id);
      } else if (resp.data.responseCode === 400) {
        this.setState({ closeAlert: true, message: resp.data.responseMessage });
      } else if (resp.data.responseCode === 500) {
        this.setState({ closeAlert: true, message: resp.data.responseMessage });
      } else if (resp.data.responseCode === 1000) {
        this.setState({ closeAlert: true, message: resp.data.responseMessage });
      }
    });
  }

  _checkAvatar(userId) {
    let variables = {
      userId: userId
    };
    return webservice(variables, "users/viewProfile", "POST").then(resp => {
      this.setState({ isLoading: false });
      if (resp.data.responseCode === 200) {
        if (
          resp.data.data[0].avatar == null ||
          typeof resp.data.data[0].avatar == undefined
        )
          this.props.navigation.navigate("SelectAvatar");
        else if (resp.data.data[0].interests.length == 0)
          this.props.navigation.navigate("SelectTopics");
        else this.props.navigation.navigate("SimpleApp");
      } else if (resp.data.responseCode === 1000) {
        this.setState({ isLoading: false }, () =>
          alert(resp.data.responseMessage)
        );
      }
    });
  }

  _recall() {
    this.setState({ apiFailed: false });
  }

  onForgotPassword() {
    this.setState({ email: "", password: "" });
    this.props.navigation.navigate("ForgotPassword");
    MusicFunc("Button_Click_Music");
  }

  render() {
    return (
      <ImageBackground
        source={require("../image/Invite_friend/bg.png")}
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
          <Loader visible={this.state.isLoading} />
          <ScrollView
            keyboardShouldPersistTaps="handled"
            style={[styles.commonContainer, { paddingTop: scaleHeight(50) }]}
          >
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                paddingTop: scaleHeight(20)
              }}
            >
              <Image
                resizeMode="stretch"
                source={require("../image/Reset_Password/logo.png")}
                style={{ height: scaleHeight(125), width: scaleWidth(230) }}
              />
            </View>
            <View style={{ marginHorizontal: scaleWidth(30) }}>
              <Text
                style={{
                  opacity: 0.7,
                  marginBottom: scaleHeight(8),
                  backgroundColor: "transparent",
                  color: "black",
                  fontWeight: "bold",
                  fontSize: normalizeFont(20)
                }}
              >
                Enter Your Email ID
              </Text>
              <View style={styles.email}>
                <Image
                  source={require("../image/create/user.png")}
                  style={{ marginLeft: scaleWidth(10) }}
                />
                <TextInput
                  allowFontScaling={false}
                  autoCapitalize="none"
                  maxLength={50}
                  value={this.state.email}
                  onChangeText={this.getEmail.bind(this)}
                  placeholderTextColor="gray"
                  underlineColorAndroid="transparent"
                  style={{
                    width: width - 80,
                    fontSize: normalizeFont(16),
                    color: "black",
                    height: scaleHeight(48),
                    fontWeight: "200",
                    marginLeft: scaleWidth(5),
                    paddingRight: scaleHeight(10)
                  }}
                  placeholder="Enter Email ID"
                  onSubmitEditing={() => this.email.focus()}
                  returnKeyType="next"
                  keyboardType="email-address"
                />
              </View>
              <Text
                style={{
                  backgroundColor: "transparent",
                  color: "#FB426B",
                  alignSelf: "flex-start"
                }}
              >
                {this.state.emailCheck}
              </Text>
              <Text
                style={{
                  opacity: 0.7,
                  marginBottom: scaleHeight(8),
                  backgroundColor: "transparent",
                  color: "black",
                  fontWeight: "bold",
                  fontSize: normalizeFont(20)
                }}
              >
                Password
              </Text>
              <View style={styles.email}>
                <Image
                  source={require("../image/create/password.png")}
                  style={{ marginLeft: scaleWidth(10) }}
                />
                <TextInput
                  allowFontScaling={false}
                  autoCapitalize="none"
                  maxLength={15}
                  value={this.state.password}
                  onChangeText={this.getPassword.bind(this)}
                  placeholderTextColor="gray"
                  underlineColorAndroid="transparent"
                  style={{
                    width: width - 80,
                    fontSize: normalizeFont(16),
                    color: "black",
                    height: scaleHeight(48),
                    fontWeight: "200",
                    marginLeft: scaleWidth(5),
                    paddingRight: scaleHeight(10)
                  }}
                  placeholder="Enter Password"
                  secureTextEntry={true}
                  returnKeyType="done"
                  ref={email => (this.email = email)}
                />
              </View>
              <Text
                style={{
                  backgroundColor: "transparent",
                  color: "#FB426B",
                  alignSelf: "flex-start"
                }}
              >
                {this.state.passwordCheck}
              </Text>
              <TouchableOpacity
                style={{ marginTop: scaleHeight(8), alignItems: "flex-end" }}
                onPress={() => {
                  this.onForgotPassword();
                }}
              >
                <Text
                  style={{
                    fontWeight: "500",
                    color: "red",
                    marginLeft: scaleWidth(10),
                    fontSize: normalizeFont(18)
                  }}
                >
                  Forgot Password?
                </Text>
              </TouchableOpacity>
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <TouchableOpacity
                  onPress={() => this._validate()}
                  style={{
                    marginVertical: scaleHeight(15),
                    backgroundColor: "#D00E17",
                    borderRadius: 10
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontWeight: "800",
                      fontSize: normalizeFont(17),
                      paddingHorizontal: scaleWidth(20),
                      paddingVertical: scaleHeight(10)
                    }}
                  >
                    Login
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ height: scaleHeight(100) }} />
            <View style={{ justifyContent: "flex-end", alignItems: "center" }}>
              <Text
                style={{
                  color: "black",
                  fontSize: normalizeFont(20),
                  fontWeight: "600"
                }}
              >
                Don't have an Account?
              </Text>
              <TouchableOpacity
                onPress={() => {
                  this.props.navigation.navigate("CreateAccount"),
                    MusicFunc("Button_Click_Music");
                }}
              >
                <Text
                  style={{
                    color: "red",
                    fontSize: normalizeFont(17),
                    fontWeight: "300",
                    textAlign: "center"
                  }}
                >
                  Create Account
                </Text>
                <View style={{ height: 1, backgroundColor: "red" }} />
              </TouchableOpacity>
            </View>
          </ScrollView>
          <Alert
            onRequestClose={() => {
              this.setState({ closeAlert: false });
            }}
            visible={this.state.closeAlert}
            alertMessage={this.state.message}
            cancelButton={() => {
              this.setState({ closeAlert: false });
            }}
            buttonTitle="OK"
          />
        </KeyboardAvoidingView>
      </ImageBackground>
    );
  }
}
