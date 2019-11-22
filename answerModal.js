import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  Modal,
  ScrollView,
  Image
} from "react-native";
import {
  scaleWidth,
  scaleHeight,
  normalizeFont
} from "../components/common/Responsive";
import styles from "../components/styles/styles";
const { width, height } = Dimensions.get("window");
const AnswerAlert = props => {
  return (
    <Modal
      visible={props.visible}
      animationType="fade"
      transparent={true}
      onRequestClose={props.onRequestClose}
    >
      <View
        style={[
          styles.profileContainer,
          { justifyContent: "center", alignItems: "center", flex: 1 }
        ]}
      >
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            marginHorizontal: scaleWidth(20),
            marginVertical: scaleHeight(50),
            backgroundColor: "#FFF",
            height: height / 2,
            width: width - scaleWidth(30),
            borderRadius: scaleWidth(7.5)
          }}
        >
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
              paddingVertical: scaleHeight(10),
              height: height / 3.5 - scaleHeight(55)
            }}
          >
            <ScrollView
              contentContainerStyle={{
                justifyContent: "center",
                alignItems: "center",
                alignSelf: "center"
              }}
            >
              {/* <View style={{ alignItems: 'center', justifyContent:'center', height: height / 3.5 - scaleHeight(55), }}> */}
              <Text
                style={{
                  fontSize: normalizeFont(20),
                  fontWeight: "500",
                  textAlign: "center",
                  padding: 10,
                  margin: 10,
                  alignSelf: "center"
                }}
              >
                {props.explanation}
              </Text>
              {/* </View> */}
            </ScrollView>
          </View>
          {/* <TouchableOpacity activeOpacity={0.5} onPress={this.GoTo_top_function} style={{
                        position: 'absolute',
                        width: 50,
                        height: 50,
                        alignItems: 'center',
                        justifyContent: 'center',
                        right: scaleWidth(5),
                        bottom: scaleHeight(75),
                    }} >
                        <Image source={require('../image/Gameplay/arrow_up.png')} style={{
                            resizeMode: 'contain',
                            width: 30,
                            height: 30,
                        }} />
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.5} onPress={this.GoTo_bottom_function} style={{
                        position: 'absolute',
                        width: 50,
                        height: 50,
                        alignItems: 'center',
                        justifyContent: 'center',
                        right: scaleWidth(5),
                        bottom: scaleHeight(38),
                    }} >
                        <Image source={require('../image/Gameplay/arrow.png')} style={{
                            resizeMode: 'contain',
                            width: 30,
                            height: 30,
                        }} />
                    </TouchableOpacity> */}
          <TouchableOpacity onPress={props.Next}>
            <ImageBackground
              source={require("../image/Btn/btn.png")}
              style={{
                justifyContent: "center",
                alignItems: "center",
                height: scaleHeight(40),
                width: scaleWidth(80),
                padding: 10,
                marginVertical: 7.5,
                borderRadius: scaleWidth(20)
              }}
            >
              <Text
                style={{
                  fontSize: normalizeFont(18),
                  color: "#fff",
                  fontWeight: "bold",
                  textAlign: "center"
                }}
              >
                {props.title}
              </Text>
            </ImageBackground>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AnswerAlert;
