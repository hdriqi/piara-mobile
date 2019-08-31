import React, { Component } from 'react'
import { Text, View } from 'react-native'
import { observer } from 'mobx-react'
import { TouchableOpacity, ScrollView, TouchableWithoutFeedback } from 'react-native-gesture-handler'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import logStore from '../../mobx/logStore'
import activityStore from '../../mobx/activityStore'
import relationStore from '../../mobx/relationStore'
import { capitalize } from '../../utils/text';

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
            letterSpacing: -0.3
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
            fontFamily: 'Inter-Regular',
            letterSpacing: -.3,
            color: `#777777`
          }}>Feeling</Text>
          <Text style={{
            fontFamily: 'Inter-SemiBold',
            fontSize: 16,
            color: `#3C3C3C`
          }}>{capitalize(logStore.inputLog.mood.name)}</Text>
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
              fontFamily: 'Inter-SemiBold',
              letterSpacing: -.5,
              color: `#3C3C3C`
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
              fontFamily: 'Inter-SemiBold',
              letterSpacing: -.5,
              color: `#3C3C3C`
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

export default AdditionalLog
