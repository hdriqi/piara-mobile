import React, { Component } from 'react'
import { Text, View, Image } from 'react-native'
import { observable, toJS } from 'mobx'
import { observer } from 'mobx-react'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { createStackNavigator } from 'react-navigation'
import { Slider } from 'react-native-elements'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import logStore from '../../mobx/logStore'
import activityStore from '../../mobx/activityStore'
import moodStore from '../../mobx/moodStore'
import rootStore from '../../mobx/rootStore'
import relationStore from '../../mobx/relationStore'

import ManageActivity from './ManageActivity'
import AddActivity from './AddActivity'
import ManageRelation from './ManageRelation'
import AddRelation from './AddRelation'
import { getMonthName } from '../../utils/date'
import { capitalize } from '../../utils/text'

import AdditionalLog from './AdditionalLog'

@observer
class AddLog extends Component {
  @observable _sliderValue = 2
  @observable _selectedActivities = []

  @observable _inputActivityName = ''

  static navigationOptions = ({ navigation }) => {
    return {
      headerStyle: {
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0
      },
      headerLeft: (
        <TouchableOpacity
          onPress={() => navigation.navigate('Tabs')}
          style={{
            padding: 8,
            alignItems: 'flex-start'
          }}
        >
          <Icon size={28} name="close" />
        </TouchableOpacity>
      ),
      headerRight: (
        <TouchableOpacity
          onPress={navigation.getParam('_next')}
          style={{
            padding: 8
          }}
        >
          <Icon size={28} name="chevron-right" />
        </TouchableOpacity>
      ),
    }
  }

  constructor(props) {
		super(props)
    this._key = this.props.navigation.getParam('key')

    this.setMood = this.setMood.bind(this)
    this._next = this._next.bind(this)
    this._currentDate = new Date(Date.parse(this._key))
    logStore.inputLog.mood = moodStore.getMoodByIndex(Math.round(this._sliderValue))
    logStore.inputLog.date = this._currentDate.getDate()
    logStore.inputLog.month = this._currentDate.getMonth() + 1
    logStore.inputLog.year = this._currentDate.getFullYear()
  }

  componentDidMount() {
    const dataExist = toJS(logStore.getLogByKey(this._key))
    if(dataExist) {
      logStore.inputLog = dataExist
      this._sliderValue = dataExist.mood.value
    }
    else {
      logStore.clearInputLog()
    }

    this.props.navigation.setParams({ 
			_next: this._next
		})
  }

  _next() {
    const [year, month, date] = this._key.split('-')
    logStore.inputLog.year = year
    logStore.inputLog.month = month
    logStore.inputLog.date = date
    this.props.navigation.navigate('AdditionalLog')
  }
  
	async setMood(val) {
    const mood = {
      ...{ value: val },
      ...moodStore.getMoodByIndex(Math.round(val))
    }
    logStore.inputLog.mood = mood
  }

  render() {
    const currentDate = new Date(Date.parse(this._key))
    console.log(this._key)
    const companionUri = logStore.inputLog.mood.name && rootStore.companion.cat[logStore.inputLog.mood.name.toLowerCase()]

    return (
      <View style={{
        paddingHorizontal: 16,
        paddingVertical: 16
      }}>
        <View style={{
          alignItems: 'center',
          paddingBottom: 8
        }}>
          <Text style={{
            fontSize: 24,
            fontFamily: 'Inter-Regular',
            textAlign: 'center',
            letterSpacing: -.3,
            color: `#777777`
          }}>{capitalize(getMonthName(currentDate.getMonth())).slice(0, 3)} {currentDate.getDate()}, {currentDate.getFullYear()}</Text>
          <Text style={{
            fontFamily: 'Inter-SemiBold',
            fontSize: 24,
            letterSpacing: -0.25,
            color: `#3C3C3C`,
            paddingBottom: 16
          }}>How was your day?</Text>
          <Text style={{
            fontSize: 24,
            fontFamily: 'Inter-Regular',
            letterSpacing: -.3,
            color: `#777777`
          }}>{capitalize(logStore.inputLog.mood.name)}</Text>
        </View>
        <View style={{
          alignItems: 'center',
          paddingBottom: 16
        }}>
          <Image style={{
            width: 300,
            height: 300
          }} source={{
            uri: companionUri
          }} />
        </View>
        <Slider
          thumbStyle={{
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: '#7DABC9'
          }}
          minimumValue={0}
          maximumValue={4}
          value={this._sliderValue}
          onValueChange={val => this.setMood(val)}
        />
      </View>
    )
  }
}


const AddLogNavigator = createStackNavigator({
  AddLog: AddLog,
  AdditionalLog: AdditionalLog,
  ManageActivity: ManageActivity,
  AddActivity: AddActivity,
  ManageRelation: ManageRelation,
  AddRelation: AddRelation
}, {
  defaultNavigationOptions: {
    headerStyle: {
      elevation: 0,
      shadowOpacity: 0,
      borderBottomWidth: 1,
      borderBottomColor: '#EEEEEE',
      backgroundColor: '#F8F8F8'
    },
  },
  transitionConfig : () => ({
  	transitionSpec: {
  		duration: 0
  	},
  })
})

export default AddLogNavigator