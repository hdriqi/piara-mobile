import React, { Component } from 'react'
import { Text, View, Image } from 'react-native'
import { Defs, LinearGradient, Stop } from 'react-native-svg'
import { LineChart } from 'react-native-svg-charts'
import * as shape from 'd3-shape'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import logStore from '../../mobx/logStore'
import { observable, transaction, toJS } from 'mobx'
import { observer } from 'mobx-react'
import { groupBy } from '../../utils/misc'
import { getTotalDaysInMonth, getPickerData, getMonthName, getMonthIdx } from '../../utils/date'
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler'
import moodStore from '../../mobx/moodStore'
import rootStore from '../../mobx/rootStore'
import { NavigationEvents, createStackNavigator } from 'react-navigation'
import { capitalize } from '../../utils/text'

import Picker from 'react-native-picker'

@observer
class AnalyticsScreen extends Component {
  @observable _chartData = []
  @observable _overviewData = {}
  @observable _moodAnalyze = []
  @observable _choosenMoodAnalysis = {}
  @observable _choosenMoodAnalyze = 'okay'

  @observable _selectedMonth = new Date().getMonth()
	@observable _selectedYear = new Date().getFullYear()

	constructor(props) {
		super(props)
    this._analyzeMonthly = this._analyzeMonthly.bind(this)
    this._monthPicker = this._monthPicker.bind(this)
    this._moodPicker = this._moodPicker.bind(this)
  }

  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: (
        <View style={{
          flex: 1,
          alignItems: 'center'
        }}>
          <TouchableOpacity
            onPress={navigation.getParam('_monthPicker')}
            style={{
              padding: 8
            }}
          >
            <View style={{
							flex: 1,
							flexDirection: 'row',
							// alignItems: 'center'
						}}>
							<View>
								<Text style={{
									// textAlign: 'center',
									fontSize: 24,
									fontFamily: 'Inter-Bold',
									fontWeight: 'bold',
									letterSpacing: -0.3
								}}>
									{navigation.getParam('_selectedMonthAndYear')}
								</Text>
							</View>
							<View>
								<Icon name="chevron-down" size={24} color={`#777777`} />
							</View>
						</View>
          </TouchableOpacity>
        </View>
      )
    }
  }
  
  componentDidMount() {
		this.props.navigation.setParams({ 
      _monthPicker: this._monthPicker,
      _selectedMonthAndYear: `${capitalize(getMonthName(this._selectedMonth))} ${this._selectedYear}`
		})
	}
  
  _init() {
    const analyze = this._analyzeMonthly(this._selectedMonth + 1, this._selectedYear)
    console.log(analyze)
    this._chartData = analyze.chart
    this._overviewData = analyze.overview
    this._moodAnalyze = analyze.analysis
    this._choosenMoodAnalysis = this._moodAnalyze.find(x => {
      return x.key === this._choosenMoodAnalyze.toLowerCase()
    }) || {}
  }

  async _moodPicker() {
		const self = this
    const pickerData = moodStore.list.map(x => capitalize(x.name))
		Picker.init({
			pickerData: pickerData,
			pickerTitleText: "Select Mood",
			pickerFontFamily: 'Inter-SemiBold',
			selectedValue: [`${capitalize(this._choosenMoodAnalyze)}`],
			pickerTextEllipsisLen: 12,
			pickerConfirmBtnText: 'Confirm',
			pickerCancelBtnText: 'Cancel',
			onPickerConfirm: (data) => {
        self._choosenMoodAnalyze = data[0]
        self._init()
			}
    })
    Picker.show()
  }
  
  async _monthPicker() {
		const self = this
    const pickerData = getPickerData().map((item) => `${capitalize(getMonthName(item.month))} ${item.year}`)
		Picker.init({
			pickerData: pickerData,
			pickerTitleText: "Select Month & Year",
			pickerFontFamily: 'Inter-SemiBold',
			selectedValue: [`${capitalize(getMonthName(this._selectedMonth))} ${this._selectedYear}`],
			pickerTextEllipsisLen: 12,
			pickerConfirmBtnText: 'Confirm',
			pickerCancelBtnText: 'Cancel',
			onPickerConfirm: (data) => {
				const [month, year] = data.toString().split(' ')
				transaction(() => {
					self._selectedMonth = getMonthIdx(month)
					self._selectedYear = year
        })
        self.props.navigation.setParams({ 
          _monthPicker: self._monthPicker,
          _selectedMonthAndYear: `${capitalize(getMonthName(self._selectedMonth))} ${self._selectedYear}`
        })
        self._init()
			}
    })
    Picker.show()
	}

	_analyzeMonthly(month, year) {
    const selectedMonthLogList = logStore.list.filter((log) => log.month == month)
    const groupByMood = groupBy(selectedMonthLogList, 'mood.name')
    const groupByMoodAnalyze = Object.keys(groupByMood).map((k) => {
      const activityCount = []
      let totalActivity = 0
      const relationCount = []
      let totalRelation = 0
      groupByMood[k].forEach((log) => {
        if(log.activityList) {
          log.activityList.forEach(activity => {
            const idx = activityCount.findIndex(x => x.id === activity.id)
            if(idx > -1) {
              activityCount[idx].count++
            }
            else {
              activityCount.push({
                ...activity,
                ...{ count: 1 }
              })
            }
            totalActivity++
          })
        }
        if(log.relationList) {
          log.relationList.forEach(relation => {
            const idx = relationCount.findIndex(x => x.id === relation.id)
            if(idx > -1) {
              relationCount[idx].count++
            }
            else {
              relationCount.push({
                ...relation,
                ...{ count: 1 }
              })
            }
            totalRelation++
          })
        }
        // sort in desc
        activityCount.sort((a, b) => b.count - a.count)
        relationCount.sort((a, b) => b.count - a.count)
      })

      return {
        activityCount,
        totalActivity,
        relationCount,
        totalRelation
      }
    })
    const analysis = groupByMoodAnalyze.map((count, idx) => {
      return {
        key: Object.keys(groupByMood)[idx],
        activityCount: count.activityCount,
        activityTotal: count.totalActivity,
        relationCount: count.relationCount,
        relationTotal: count.totalRelation,
      }
    })
    const chart = [...Array(getTotalDaysInMonth(month, year)).keys()].map((date) => {
      const targetLog = logStore.list.find((log) => {
        return log.key == `${year}-${month}-${date+1}`
      })
      return parseFloat(targetLog ? targetLog.mood.value : 2)
    })

    const average = data => data.reduce((sum, value) => sum + value, 0) / data.length
    const standardDeviation = values => Math.sqrt(average(values.map(value => (value - average(values)) ** 2)))

    const avgMood = average(selectedMonthLogList.map(log => {
      return log.mood && log.mood.value ? log.mood.value : 0
    }))
    const variationMood = standardDeviation(selectedMonthLogList.map(log => {
      return log.mood && log.mood.value ? log.mood.value : 0
    })) / avgMood
    const avgActivity = average(selectedMonthLogList.map(log => {
      return Array.isArray(log.activityList) ? log.activityList.length : 0 
    }))
    const avgRelation = average(selectedMonthLogList.map(log => {
      return Array.isArray(log.relationList) ? log.relationList.length : 0
    }))
 
    const overviewMood = moodStore.list[Math.round(avgMood)] && moodStore.list[Math.round(avgMood)].name
    const overviewMoodSwing = variationMood > 1 ? 'YES' : 'NO'
    const overviewAvgActivity = Math.round(avgActivity)
    const overviewAvgRelation = Math.round(avgRelation)

    const overview = {
      avgMood: overviewMood,
      moodSwing: overviewMoodSwing,
      avgActivity: overviewAvgActivity,
      avgRelation: overviewAvgRelation
    }

    return {
      chart: chart,
      overview: overview,
      analysis: analysis
    }
  }

	render() {
		const Gradient = () => (
			<Defs key={'gradient'}>
					<LinearGradient id={'gradient'} x1={'0'} y={'0%'} x2={'100%'} y2={'0%'}>
							<Stop offset={'0%'} stopColor={'rgb(134, 65, 184)'}/>
							<Stop offset={'100%'} stopColor={'rgb(66, 194, 184)'}/>
					</LinearGradient>
			</Defs>
		)

		return (
			<React.Fragment>
        <NavigationEvents
					onWillFocus={payload => {
						this._init()
					}}
				/>
        {
          Array.isArray(this._moodAnalyze) && this._moodAnalyze.length > 0 ? (
            <ScrollView>
              <LineChart
                style={{ height: 100 }}
                curve={shape.curveBundle}
                data={this._chartData}
                animate={true}
                svg={{
                  strokeWidth: 4,
                  stroke: 'url(#gradient)',
                }}
                contentInset={{ top: 20, bottom: 20 }}
                yMin={0}
                yMax={4}
              >
                <Gradient />
              </LineChart>
              <View style={{
                marginVertical: 8,
                borderBottomWidth: 1,
                borderBottomColor: '#EEEEEE'
              }}></View>
              <View style={{
                paddingHorizontal: 16,
              }}>
                <Text style={{
                  fontSize: 18,
                  fontFamily: 'Inter-SemiBold',
                  paddingVertical: 8,
                  color: '#282828'
                }}>OVERVIEW</Text>
              </View>
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                paddingHorizontal: 16
              }}>
                <View style={{
                  width: '33%'
                }}>
                  <Text style={{
                    fontSize: 12,
                    fontFamily: 'Inter-Regular',
                    color: '#777777'
                  }}>Avg. Mood</Text>
                  <Text style={{
                    fontSize: 18,
                    fontFamily: 'Inter-SemiBold',
                    paddingBottom: 8,
                    color: '#282828'
                  }}>{this._overviewData.avgMood && this._overviewData.avgMood.toUpperCase()}</Text>
                </View>
                {/* <View style={{
                  width: '50%'
                }}>
                  <Text style={{
                    fontSize: 12,
                    fontFamily: 'Inter-Regular',
                    color: '#282828'
                  }}>MOOD SWING</Text>
                  <Text style={{
                    fontSize: 18,
                    fontFamily: 'Inter-SemiBold',
                    paddingBottom: 8,
                    color: '#282828'
                  }}>{this._overviewData.moodSwing && this._overviewData.moodSwing.toUpperCase()}</Text>
                </View> */}
                <View style={{
                  width: '33%'
                }}>
                  <Text style={{
                    fontSize: 12,
                    fontFamily: 'Inter-Regular',
                    color: '#777777'
                  }}>Avg. Activity</Text>
                  <Text style={{
                    fontSize: 12,
                    fontFamily: 'Inter-Regular',
                    paddingBottom: 8,
                    color: '#282828'
                  }}><Text style={{
                    fontSize: 18,
                    fontFamily: 'Inter-SemiBold',
                    color: '#282828'
                  }}>{this._overviewData.avgActivity}</Text> / day</Text>
                </View>
                <View style={{
                  width: '33%'
                }}>
                  <Text style={{
                    fontSize: 12,
                    fontFamily: 'Inter-Regular',
                    color: '#777777'
                  }}>Avg. Relation</Text>
                  <Text style={{
                    fontSize: 12,
                    fontFamily: 'Inter-Regular',
                    paddingBottom: 8,
                    color: '#282828'
                  }}><Text style={{
                    fontSize: 18,
                    fontFamily: 'Inter-SemiBold',
                    color: '#282828'
                  }}>{this._overviewData.avgRelation}</Text> / day</Text>
                </View>
              </View>
              <View style={{
                marginVertical: 8,
                borderBottomWidth: 1,
                borderBottomColor: '#EEEEEE'
              }}></View>
              <View style={{
                paddingHorizontal: 16,
                flexDirection: 'row',
                justifyContent: 'space-between'
              }}>
                <View>
                  <Text style={{
                    fontSize: 18,
                    fontFamily: 'Inter-SemiBold',
                    paddingVertical: 8,
                    color: '#282828'
                  }}>MOOD ANALYSIS</Text>
                </View>
                <TouchableOpacity
                  onPress={this._moodPicker}
                >
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}>
                    <Text style={{
                      fontSize: 18,
                      fontFamily: 'Inter-SemiBold',
                      paddingVertical: 8,
                      color: '#282828'
                    }}>{this._choosenMoodAnalyze && this._choosenMoodAnalyze.toUpperCase()} </Text>
                    <View>
                      <Icon name="chevron-down" size={20} color={`#777777`} />
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
              <View style={{
                paddingHorizontal: 16
              }}>
                <Text style={{
                  fontSize: 12,
                  fontFamily: 'Inter-Regular',
                  color: '#777777',
                  paddingVertical: 8
                }}>Activity</Text>
                {
                  this._choosenMoodAnalysis.activityCount &&  this._choosenMoodAnalysis.activityCount.length > 0 ?(
                    this._choosenMoodAnalysis.activityCount.map(activity => {
                      return (
                        <View style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          marginBottom: 12
                        }} key={activity.id}>
                          <View style={{
                            flexDirection: 'row',
                            alignItems: 'center'
                          }}>
                            <Icon style={{
                              marginRight: 8
                            }} size={20} name={activity.icon} color={`#282828`} />
                            <Text style={{
                              fontFamily: 'Inter-Regular',
                              fontSize: 16,
                              color: `#282828`,
                              letterSpacing: -0.3
                            }}>{activity.name}</Text>
                          </View>
                          <View>
                          <Text style={{
                            fontFamily: 'Inter-Regular',
                            fontSize: 16,
                            color: `#282828`,
                            letterSpacing: -0.3
                          }}>{Math.round((activity.count/this._choosenMoodAnalysis.activityTotal) * 100)}%</Text>
                          </View>
                        </View>
                      )
                    })
                  ) : (
                    <Text style={{
                      fontFamily: 'Inter-Regular',
                      fontSize: 16,
                      color: `#282828`,
                      letterSpacing: -0.3
                    }}>No Data</Text>
                  ) 
                }
                <Text style={{
                  fontSize: 12,
                  fontFamily: 'Inter-Regular',
                  color: '#777777',
                  paddingVertical: 8,
                }}>Relation</Text>
                {
                  this._choosenMoodAnalysis.relationCount && this._choosenMoodAnalysis.relationCount.length > 0 ? (
                    this._choosenMoodAnalysis.relationCount.map(relation => {
                      return (
                        <View style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          marginBottom: 8
                        }} key={relation.id}>
                          <View style={{
                            flexDirection: 'row',
                            alignItems: 'center'
                          }}>
                            <Icon style={{
                              marginRight: 8
                            }} size={20} name={relation.icon} color={`#282828`} />
                            <Text style={{
                              fontFamily: 'Inter-Regular',
                              fontSize: 16,
                              color: `#282828`,
                              letterSpacing: -0.3
                            }}>{relation.name}</Text>
                          </View>
                          <View>
                          <Text style={{
                            fontFamily: 'Inter-Regular',
                            fontSize: 16,
                            color: `#282828`,
                            letterSpacing: -0.3
                          }}>{Math.round((relation.count/this._choosenMoodAnalysis.relationTotal) * 100)}%</Text>
                          </View>
                        </View>
                      )
                    })
                  ) : (
                    <Text style={{
                      fontFamily: 'Inter-Regular',
                      fontSize: 16,
                      color: `#282828`,
                      letterSpacing: -0.3
                    }}>No Data</Text>
                  ) 
                }
              </View>
            </ScrollView>
          ) : (
            <View style={{
              flex: 1
            }}>
              <View style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              </View>
              <View style={{
                flex: 6,
                alignItems: 'center',
                justifyContent: 'center',
                padding: 16
              }}>
                <Image style={{
                  width: 300,
                  height: 300
                }} source={{
                  uri: rootStore.asset.image.confuseLog
                }} />
              </View>
              <View style={{
                flex: 6,
                alignItems: 'center',
                paddingHorizontal: 16
              }}>
                <Text style={{
                  fontFamily: 'Inter-SemiBold',
                  fontSize: 24,
                  textAlign: 'center',
                  color: '#C9A07D'
                }}>Insufficient Mood</Text>
                <Text style={{
                  fontFamily: 'Inter-Regular',
                  fontSize: 16,
                  textAlign: 'center',
                  color: `#777777`,
                  letterSpacing: -0.3
                }}>Add more mood to analyze your emotional state and things that affect your mood</Text>
              </View>
            </View>
          )
        }
			</React.Fragment>
		)
	}
}

const AnalyticsNavigator = createStackNavigator({
	Analytics: AnalyticsScreen
}, {
	defaultNavigationOptions: {
    headerStyle: {
      elevation: 0,
      shadowOpacity: 0
    },
  },
})

AnalyticsNavigator.navigationOptions = ({ navigation }) => {
  let tabBarVisible = true
  if (navigation.state.index > 0) {
    tabBarVisible = false
  }

  return {
    tabBarVisible,
  }
}

export default AnalyticsNavigator