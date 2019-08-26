import React, { Component } from 'react'
import { Text, View, Image } from 'react-native'
import { observable, toJS } from 'mobx'
import { observer } from 'mobx-react'
import { TouchableWithoutFeedback, TouchableOpacity, ScrollView } from 'react-native-gesture-handler'
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
import { getDayName, getMonthName } from '../../utils/date'
import { capitalize } from '../../utils/text'

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
          onPress={() => navigation.navigate('AdditionalLog')}
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
            fontSize: 28,
            fontFamily: 'Inter-Medium',
            textAlign: 'center',
            letterSpacing: -.5
          }}>{capitalize(getMonthName(currentDate.getMonth())).slice(0, 3)} {currentDate.getDate()}, {currentDate.getFullYear()}</Text>
          <Text style={{
            fontSize: 28,
            fontFamily: 'Inter-Medium',
            textAlign: 'center',
            letterSpacing: -.5,
            paddingBottom: 16
          }}>How was your day?</Text>
          <Text style={{
            fontSize: 24,
            fontFamily: 'Inter-Regular',
            letterSpacing: -.3,
            color: '#2E2E2E'
          }}>{logStore.inputLog.mood.name}</Text>
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
          // style={{
          //   width: '100%'
          // }}
          thumbStyle={{
            width: 40,
            height: 40,
            borderRadius: 10
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

@observer
class AdditionalLog extends Component {
  constructor(prop) {
    super(prop)
    this._saveLog = this._saveLog.bind(this)
  }

  static navigationOptions = ({ navigation }) => {
    return {
      headerLeft: (
        <TouchableOpacity
          onPress={() => navigation.navigate('AddLog')}
          style={{
            padding: 8,
            alignItems: 'flex-start'
          }}
        >
          <Icon size={28} name="chevron-left" />
        </TouchableOpacity>
      ),
      headerTitle: (
        <View style={{
          flex: 1,
          alignItems: 'center'
        }}>
          <Text style={{
            fontFamily: "Inter-Bold",
            fontSize: 18,
            letterSpacing: -0.5
          }}>Add Log</Text>
        </View>
      ),
      headerRight: (
        <TouchableOpacity
        onPress={navigation.getParam('_saveLog')}
          style={{
            padding: 8
          }}
        >
          <Icon size={28} name="check" />
        </TouchableOpacity>
      ),
    }
  }

  componentDidMount() {
    this.props.navigation.setParams({
      _saveLog: this._saveLog
    })
  }

  async _saveLog() {
    await logStore.saveLog()
    this.props.navigation.navigate('Tabs')
  }

  async _addActivity(item) {
    const itemIdx = logStore.inputLog.activityList.findIndex((el) => el.id === item.id)
    if(itemIdx > -1) {
      logStore.inputLog.activityList.splice(itemIdx, 1)
    }
    else {
      logStore.inputLog.activityList.push(item)
    }
  }

  async _addRelation(item) {
    const itemIdx = logStore.inputLog.relationList.findIndex((el) => el.id === item.id)
    if(itemIdx > -1) {
      logStore.inputLog.relationList.splice(itemIdx, 1)
    }
    else {
      logStore.inputLog.relationList.push(item)
    }
  }

  render() {
    return (
      <ScrollView style={{
        paddingHorizontal: 16,
        paddingVertical: 16
      }}>
        <View style={{
          alignItems: 'center',
          paddingBottom: 28
        }}>
          <Text style={{
            fontFamily: 'Inter-Medium',
            fontSize: 16
          }}>Feeling</Text>
          <Text style={{
            fontFamily: 'Inter-Bold',
            fontSize: 16
          }}>{logStore.inputLog.mood.name}</Text>
        </View>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
          <View style={{
            alignItems: 'center',
            paddingBottom: 8
          }}>
            <Text style={{
              fontSize: 16,
              fontFamily: 'Inter-Bold',
              letterSpacing: -.5
            }}>What have you been up to?</Text>
          </View>
          <TouchableOpacity style={{
            alignItems: 'center',
          }} onPress={() => this.props.navigation.navigate('ManageActivity')}>
            <Icon style={{
              position: 'relative',
              top: '-50%'
            }} name="settings-helper" size={30} />
          </TouchableOpacity>
        </View>
        <View style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          paddingBottom: 16
        }}>
          {
            activityStore.list.map((item, idx) => {
              const isActive = logStore.inputLog.activityList.findIndex((el) => el.id === item.id) > -1 ? true : false
              return (
                <View style={{
                  width: '25%',
                  paddingVertical: 12
                }} key={item.id}>
                  <TouchableWithoutFeedback
                    onPress={() => this._addActivity(item)}
                  >
                    <View style={{
                      alignItems: 'center',
                      opacity: isActive ? 1 : 0.4
                    }}>
                      <Icon name={item.icon} size={24} />
                      <Text style={{
                        fontFamily: 'Inter-Medium',
                        fontSize: 12,
                        letterSpacing: -.3
                      }} ellipsizeMode='tail' numberOfLines={1}>{ item.name }</Text>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              )
            })
          }
        </View>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
          <View style={{
            alignItems: 'center',
            paddingBottom: 8
          }}>
            <Text style={{
              fontSize: 16,
              fontFamily: 'Inter-Bold',
              letterSpacing: -.5
            }}>Who are you with?</Text>
          </View>
          <TouchableOpacity style={{
            alignItems: 'center',
          }} onPress={() => this.props.navigation.navigate('ManageRelation')}>
            <Icon style={{
              position: 'relative',
              top: '-50%'
            }} name="settings-helper" size={30} />
          </TouchableOpacity>
        </View>
        <View style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          paddingBottom: 16
        }}>
          {
            relationStore.list.map((item) => {
              const isActive = logStore.inputLog.relationList.findIndex((el) => el.id === item.id) > -1 ? true : false
              return (
                <View style={{
                  width: '25%',
                  paddingVertical: 12
                }} key={item.id}>
                  <TouchableWithoutFeedback
                    onPress={() => this._addRelation(item)}
                  >
                    <View style={{
                      alignItems: 'center',
                      opacity: isActive ? 1 : 0.4
                    }}>
                      <Icon name={item.icon} size={24} />
                      <Text style={{
                        fontFamily: 'Inter-Medium',
                        fontSize: 12,
                        letterSpacing: -.3
                      }} ellipsizeMode='tail' numberOfLines={1}>{ item.name }</Text>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              )
            })
          }
        </View>
      </ScrollView>
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