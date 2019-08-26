import React, { Component } from "react"
import { Button, Text, View, Linking } from "react-native"
import { createSwitchNavigator, createBottomTabNavigator, createStackNavigator, createAppContainer } from 'react-navigation'
import AsyncStorage from '@react-native-community/async-storage'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import PushNotification from 'react-native-push-notification'

import RNBlockstackSdk from "react-native-blockstack"

import HomeScreen from './screen/Home'
import AddLogNavigator from './screen/AddLog'
import SettingNavigator from './screen/Setting'

import { TouchableWithoutFeedback } from "react-native-gesture-handler"
import rootStore from "./mobx/rootStore"
import activityStore from './mobx/activityStore'
import logStore from "./mobx/logStore"
import relationStore from "./mobx/relationStore"

const createSession = async () => {
  config = {
    appDomain: "https://flamboyant-darwin-d11c17.netlify.com",
    scopes: ["store_write"],
    redirectUrl: "/redirect.html"
  }
  console.log("blockstack:" + RNBlockstackSdk)
  hasSession = await RNBlockstackSdk.hasSession()
  if (!hasSession["hasSession"]) {
    result = await RNBlockstackSdk.createSession(config)
    console.log("created " + result["loaded"])
  } else {
    console.log("reusing session")
  }
}

class AuthLoadingScreen extends Component {
  constructor(props) {
    super(props)
  }

  async componentDidMount() {
    await createSession()
    await rootStore.fetchInitialSetting()
    await activityStore.fetchInitialActivity()
    await logStore.fetchInitialLog()
    await relationStore.fetchInitialRelation()
    const self = this
    PushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister: function(token) {
        console.log("TOKEN:", token)
      },
    
      // (required) Called when a remote or local notification is opened or received
      onNotification: function(notification) {
        console.log("NOTIFICATION:", notification)
        const currentDate = new Date()
        self.props.navigation.navigate('AddLog', {
          key: `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`
        })
        // process the notification
      },
    
      // ANDROID ONLY: GCM or FCM Sender ID (product_number) (optional - not required for local notifications, but is need to receive remote push notifications)
      senderID: "YOUR GCM (OR FCM) SENDER ID",
    
      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true
      },
    
      // Should the initial notification be popped automatically
      // default: true
      popInitialNotification: true,
    
      /**
       * (optional) default: true
       * - Specified if permissions (ios) and token (android and ios) will requested or not,
       * - if not, you must call PushNotificationsHandler.requestPermissions() later
       */
      requestPermissions: true
    })

    // PushNotification.localNotificationSchedule({
    //   /* iOS and Android properties */
    //   title: "Cariin titel yang bagus", // (optional)
    //   message: "Cariin tulisan yang bagus untuk isi", // (required)
    //   date: new Date(`2019-08-19T20:01:00`),
    //   repeatType: 'day',
    //   playSound: true, // (optional) default: true
    //   soundName: 'default', // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
    // })

    const signedIn = await AsyncStorage.getItem('authToken')
    this.props.navigation.navigate(signedIn ? 'App' : 'Auth')
  }

  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    )
  }
}

class SignInScreen extends Component {
  constructor(props) {
    super(props)
  }

  async componentDidMount() {
    var app = this
    var pendingAuth = false

    Linking.getInitialURL().then(async (url) => {
      if (url && !pendingAuth) {
        pendingAuth = true
        var query = url.split(":")
        if (query.length > 1) {
          var parts = query[1].split("=")
          if (parts.length > 1) {
            const result = await RNBlockstackSdk.handlePendingSignIn(parts[1])
            await AsyncStorage.setItem('authToken', result.authResponseToken)
            app.props.navigation.navigate('App')
          }
        }
      }
    }).catch(err => console.error('An error occurred', err))
  }

  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Blockstack React Native Example</Text>

        <Button
          title="Sign In with Blockstack"
          onPress={() => this.signIn()}
        />
      </View>
    )
  }

  async signIn() {
    RNBlockstackSdk.signIn()
  }
}

const TabsNavigator = createBottomTabNavigator({
  Home: HomeScreen,
  Analytics: SettingNavigator,
  Settings: SettingNavigator,
}, {
  tabBarOptions: {
    showLabel: false
  },
  defaultNavigationOptions: ({ navigation }) => ({
    tabBarIcon: ({ focused, horizontal, tintColor }) => {
      const { routeName } = navigation.state
      let iconName
      if (routeName === 'Home') {
        iconName = `home-variant`
      } 
      else if (routeName === 'Settings') {
        iconName = `account`
      }
      else if (routeName === 'Analytics') {
        iconName = `chart-bubble`
      }

      return <Icon name={iconName} size={25} color={tintColor} />
    },
  })
})

const AppStack = createStackNavigator({
  Tabs: TabsNavigator,
  AddLog: AddLogNavigator,
}, {
  headerMode: 'none',
  navigationOptions: {
    headerVisible: false,
  }
})

const AuthStack = createStackNavigator({ SignIn: SignInScreen })

const AppRouter = createAppContainer(createSwitchNavigator(
  {
    AuthLoading: AuthLoadingScreen,
    App: AppStack,
    Auth: AuthStack,
  },
  {
    initialRouteName: 'AuthLoading',
  }
))

export default AppRouter