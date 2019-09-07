import React, { Component } from "react"
import { Button, Text, View, Linking, Image } from "react-native"
import { createSwitchNavigator, createBottomTabNavigator, createStackNavigator, createAppContainer } from 'react-navigation'
import AsyncStorage from '@react-native-community/async-storage'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import PushNotification from 'react-native-push-notification'

import RNBlockstackSdk from "react-native-blockstack"

import HomeScreen from './screen/Home'
import AddLogNavigator from './screen/AddLog'
import AnalyticsNavigator from './screen/Analytics'
import SettingNavigator from './screen/Setting'
import OnboardingScreen from './screen/Onboarding'

import { TouchableWithoutFeedback, TouchableOpacity } from "react-native-gesture-handler"
import rootStore from "./mobx/rootStore"
import activityStore from './mobx/activityStore'
import logStore from "./mobx/logStore"
import relationStore from "./mobx/relationStore"
import { observable } from "mobx";
import { observer } from "mobx-react"

const createSession = async () => {
  config = {
    appDomain: "https://auth.piara.me",
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

    // check if onboarding
    const onboardingStatus = rootStore.userSetting.onboarding
    if(onboardingStatus) {
      return this.props.navigation.navigate('Onboarding')
    }

    const signedIn = await AsyncStorage.getItem('authToken')
    try {
      const parsedData = JSON.parse(signedIn) 
      this.props.navigation.navigate(parsedData ? 'App' : 'Auth')
    } catch (err) {
      this.props.navigation.navigate(signedIn ? 'App' : 'Auth')
    }
  }

  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    )
  }
}

@observer
class SignInScreen extends Component {
  @observable _isLoading = false

  constructor(props) {
    super(props)
    this._dummyDeepLinkedUrl = null
  }

  async componentDidMount() {
    var app = this

    const prevRoute = this.props.navigation.getParam('prevRoute')

    Linking.getInitialURL().then(async (url) => {
      if (url && prevRoute !== 'logOut' && !this._isLoading) {
        this._isLoading = true
        var query = url.split(":")
        if (query.length > 1) {
          var parts = query[1].split("=")
          if (parts.length > 1) {
            const result = await RNBlockstackSdk.handlePendingSignIn(parts[1])
            console.log(result.decentralizedID)
            await AsyncStorage.setItem('authToken', result.authResponseToken)
            await AsyncStorage.setItem('decentralizedId', result.decentralizedID)
            await rootStore.restoreData()
            this._isLoading = false
            app.props.navigation.navigate('App')
          }
        }
      }
    }).catch(err => console.log('An error occurred', err))
  }

  render() {
    return (
      <View style={{ 
        flex: 1, 
        paddingHorizontal: 32,
        justifyContent: 'center',
      }}>
        <Image style={{
          width: 100,
          height: 100,
          position: 'absolute',
          left: 16,
          top: 32
        }} source={{
          uri: `data:image/png;base64,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`
        }} />
        <Text style={{
          fontSize: 28,
          fontFamily: 'Inter-SemiBold',
          paddingBottom: 4,
          color: '#3C3C3C',
          letterSpacing: -0.3
        }}>Piara</Text>
        <Text style={{
          fontSize: 20,
          fontFamily: 'Inter-Regular',
          paddingBottom: 16,
          color: '#777777',
          letterSpacing: -0.3
        }}>Become the best of yourself</Text>
        <TouchableOpacity
          onPress={() => this.signIn()}
        >
          {
            this._isLoading ? (
              <Text style={{
                fontSize: 24,
                fontFamily: 'Inter-SemiBold',
                color: '#7DABC9',
                letterSpacing: -0.3,
                opacity: 0.3
              }}>Signing in...</Text>
            ) : (
              <Text style={{
                fontSize: 24,
                fontFamily: 'Inter-SemiBold',
                color: '#7DABC9',
                letterSpacing: -0.3,
                opacity: 1
              }}>Sign in with Blockstack -></Text>
            )
          }
        </TouchableOpacity>
      </View>
    )
  }

  async signIn() {
    RNBlockstackSdk.signIn()
  }
}

const TabsNavigator = createBottomTabNavigator({
  Home: HomeScreen,
  Analytics: AnalyticsNavigator,
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

const AuthStack = createStackNavigator({ 
  SignIn: SignInScreen 
}, {
  headerMode: 'none',
  navigationOptions: {
    headerVisible: false,
  }
})

const AppRouter = createAppContainer(createSwitchNavigator(
  {
    AuthLoading: AuthLoadingScreen,
    App: AppStack,
    Auth: AuthStack,
    Onboarding: OnboardingScreen,
  },
  {
    initialRouteName: 'AuthLoading',
  }
))

export default AppRouter