import React, { Component } from 'react'
import { Text, View } from 'react-native'
import { Defs, LinearGradient, Stop } from 'react-native-svg'
import { LineChart } from 'react-native-svg-charts'
import * as shape from 'd3-shape'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import logStore from '../../mobx/logStore'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { groupBy } from '../../utils/misc'
import { getTotalDaysInMonth } from '../../utils/date'
import { ScrollView } from 'react-native-gesture-handler';
import moodStore from '../../mobx/moodStore';
import { NavigationEvents } from 'react-navigation';
import { capitalize } from '../../utils/text';

@observer
class index extends Component {
  @observable _chartData = []
  @observable _overviewData = {}
  @observable _moodAnalyze = []
  @observable _choosenMoodAnalysis = {}
  @observable _choosenMoodAnalyze = 'okay'

	constructor(props) {
		super(props)
		this._analyzeMonthly = this._analyzeMonthly.bind(this)
  }
  
  _init() {
    const currentDate = new Date()
		const analyze = this._analyzeMonthly(currentDate.getMonth() + 1, currentDate.getFullYear())
    this._chartData = analyze.chart
    this._overviewData = analyze.overview
    this._moodAnalyze = analyze.analysis
    this._choosenMoodAnalysis = this._moodAnalyze.find(x => {
      return x.key === this._choosenMoodAnalyze
    }) || {}
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
        return log.date == date
      })
      return parseInt(targetLog ? targetLog.mood.value : 2)
    })

    const average = data => data.reduce((sum, value) => sum + value) / data.length
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
 
    const overviewMood = moodStore.list[Math.round(avgMood)].name
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
			<ScrollView>
        <NavigationEvents
					onWillFocus={payload => {
						this._init()
					}}
				/>
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
            }}>ANALYTICS</Text>
          </View>
          <View>
            <Text style={{
              fontSize: 18,
              fontFamily: 'Inter-SemiBold',
              paddingVertical: 8,
              color: '#282828'
            }}>AUGUST 2019</Text>
          </View>
        </View>
				<LineChart
						style={{ height: 200 }}
						curve={shape.curveBasisOpen}
						data={this._chartData}
						animate={true}
						svg={{
							strokeWidth: 4,
							stroke: 'url(#gradient)',
						}}
						contentInset={{ top: 20, bottom: 20 }}
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
            width: '50%'
          }}>
            <Text style={{
							fontSize: 12,
							fontFamily: 'Inter-Regular',
							color: '#282828'
						}}>AVG MOOD</Text>
            <Text style={{
							fontSize: 18,
							fontFamily: 'Inter-SemiBold',
							paddingBottom: 8,
							color: '#282828'
						}}>{this._overviewData.avgMood && this._overviewData.avgMood.toUpperCase()}</Text>
          </View>
          <View style={{
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
          </View>
          <View style={{
            width: '50%'
          }}>
            <Text style={{
							fontSize: 12,
							fontFamily: 'Inter-Regular',
							color: '#282828'
						}}>AVG ACTIVITY</Text>
            <Text style={{
							fontSize: 12,
							fontFamily: 'Inter-Regular',
							paddingBottom: 8,
							color: '#282828'
						}}><Text style={{
              fontSize: 18,
							fontFamily: 'Inter-SemiBold',
							color: '#282828'
            }}>{this._overviewData.avgActivity}</Text>/day</Text>
          </View>
          <View style={{
            width: '50%'
          }}>
            <Text style={{
							fontSize: 12,
							fontFamily: 'Inter-Regular',
							color: '#282828'
						}}>AVG RELATION</Text>
            <Text style={{
							fontSize: 12,
							fontFamily: 'Inter-Regular',
							paddingBottom: 8,
							color: '#282828'
						}}><Text style={{
              fontSize: 18,
							fontFamily: 'Inter-SemiBold',
							color: '#282828'
            }}>{this._overviewData.avgRelation}</Text>/day</Text>
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
          <View>
            <Text style={{
              fontSize: 18,
              fontFamily: 'Inter-SemiBold',
              paddingVertical: 8,
              color: '#282828'
            }}>{this._choosenMoodAnalyze && this._choosenMoodAnalyze.toUpperCase()}</Text>
          </View>
        </View>
        <View style={{
          paddingHorizontal: 16
        }}>
          <Text style={{
            fontSize: 12,
            fontFamily: 'Inter-Regular',
            color: '#282828',
            paddingVertical: 8
          }}>ACTIVITIES</Text>
          {
            this._choosenMoodAnalysis.activityCount && this._choosenMoodAnalysis.activityCount.map(activity => {
              return (
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 8
                }}>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}>
                    <Icon style={{
                      marginRight: 8
                    }} size={20} name={activity.icon} />
                    <Text style={{
                      fontSize: 16,
                      fontFamily: 'Inter-Regular'
                    }}>{activity.name}</Text>
                  </View>
                  <View>
                  <Text style={{
                    fontSize: 16,
                    fontFamily: 'Inter-SemiBold'
                  }}>{Math.round((activity.count/this._choosenMoodAnalysis.activityTotal) * 100)}%</Text>
                  </View>
                </View>
              )
            })
          }
          <Text style={{
            fontSize: 12,
            fontFamily: 'Inter-Regular',
            color: '#282828',
            paddingVertical: 8,
          }}>RELATIONS</Text>
          {
            this._choosenMoodAnalysis.relationCount && this._choosenMoodAnalysis.relationCount.map(relation => {
              return (
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 8
                }}>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}>
                    <Icon style={{
                      marginRight: 8
                    }} size={20} name={relation.icon} />
                    <Text style={{
                      fontSize: 16,
                      fontFamily: 'Inter-Regular'
                    }}>{relation.name}</Text>
                  </View>
                  <View>
                  <Text style={{
                    fontSize: 16,
                    fontFamily: 'Inter-SemiBold'
                  }}>{Math.round((relation.count/this._choosenMoodAnalysis.relationTotal) * 100)}%</Text>
                  </View>
                </View>
              )
            })
          }
        </View>
			</ScrollView>
		)
	}
}

export default index
