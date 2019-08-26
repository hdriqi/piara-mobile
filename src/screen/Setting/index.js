import React, { Component } from 'react'
import { Text, View, Switch } from 'react-native'
import { createStackNavigator } from 'react-navigation'
import SetupPin from './SetupPin'
import { NavigationEvents } from 'react-navigation'
import rootStore from '../../mobx/rootStore'
import { observer } from 'mobx-react'
import { observable } from 'mobx'
import Picker from 'react-native-picker'
import { TouchableOpacity, ScrollView } from 'react-native-gesture-handler'
import PushNotification from 'react-native-push-notification'

@observer
export class SettingScreen extends Component {
	@observable _switchState = null
	@observable _switchReminder = null

	constructor(prop) {
		super(prop)
		this.switchOnPress = this.switchOnPress.bind(this)
		this._switchReminderOnPress = this._switchReminderOnPress.bind(this)
		this._init = this._init.bind(this)
		this._pickerData = [Array.from(Array(24), (e,i)=>(i+1).toString().padStart(2, '0')), Array.from(Array(60), (e,i)=>i.toString().padStart(2, '0'))]
	}

	static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: (
        <View style={{
          flex: 1,
          alignItems: 'center'
        }}>
          <Text style={{
            fontFamily: "Inter-Bold",
            fontSize: 18,
            letterSpacing: -0.5
          }}>Setting</Text>
        </View>
      )
    }
  }

	async _init() {
		this._switchState = rootStore.userSetting.pin && rootStore.userSetting.pin.length > 0 ? true : false
		Picker.init({
			isLoop: true,
			pickerData: this._pickerData,
			pickerTitleText: "Select Time",
			pickerFontFamily: 'Inter-SemiBold',
			selectedValue: [rootStore.userSetting.reminderTime.hour, rootStore.userSetting.reminderTime.minute],
			pickerTextEllipsisLen: 12,
			pickerConfirmBtnText: 'Confirm',
			pickerCancelBtnText: 'Cancel',
			onPickerConfirm: async (data) => {
				const selectedHour = data[0]
				const selectedMinute = data[1].toString().padStart(2, '0')

				await rootStore.setReminderTime({
					hour: selectedHour,
					minute: selectedMinute
				})

				const currentTime = new Date()
				let currentYear = currentTime.getFullYear()
				let currentMonth = currentTime.getMonth() + 1
				let currentDate = currentTime.getDate()
				if(currentTime.getHours() >= selectedHour && currentTime.getMinutes() > selectedMinute) {
					currentDate++
				}
				const scheduleTime = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${currentDate}T${selectedHour}:${selectedMinute}:00`
				PushNotification.cancelAllLocalNotifications()
				PushNotification.localNotificationSchedule({
					title: "Cariin titel yang bagus", // (optional)
					message: "Cariin tulisan yang bagus untuk isi", // (required)
					date: new Date(Date.parse(scheduleTime)),
					repeatType: 'day',
					playSound: true,
					soundName: 'default',
				})
			}
		})
	}

	async _switchReminderOnPress(val) {
		this._switchReminder = val
		PushNotification.cancelAllLocalNotifications()
		await rootStore.setReminder(val)
	}
	
	switchOnPress(val) {
		if(val) {
			this._switchState = true
			this.props.navigation.navigate('SetupPin')
		}
		else {
			this._switchState = false
			rootStore.setPIN('')
		}	
	}

	render() {
		return (
			<ScrollView>
				<NavigationEvents
					onWillFocus={payload => {
						this._init()
					}}
				/>
				<View style={{
					paddingVertical: 16,
					borderBottomWidth: 1,
					borderBottomColor: '#EEEEEE'
				}}>
					<View style={{
						paddingHorizontal: 16
					}}>
						<Text style={{
							fontSize: 16,
							fontFamily: 'Inter-SemiBold',
							paddingBottom: 8,
							color: '#282828'
						}}>Reminder</Text>
						<View style={{
							flexDirection: 'row',
							justifyContent: 'space-between',
							alignItems: 'center',
						}}>
							<View style={{
								paddingBottom: 8
							}}>
								<Text style={{
									fontSize: 16,
									fontFamily: 'Inter-Regular',
									color: '#282828'
								}}>Notification</Text>
							</View>
							<View>
								<Switch value={this._switchReminder} onValueChange={this._switchReminderOnPress} />
							</View>
						</View>
						<View style={{
							flexDirection: 'row',
							justifyContent: 'space-between',
							alignItems: 'center'
						}}>
							<View style={{
								paddingBottom: 8
							}}>
								<Text style={{
									fontSize: 16,
									fontFamily: 'Inter-Regular',
								}}>Time</Text>
							</View>
							<TouchableOpacity
								onPress={() => Picker.show()}
							>
								<Text style={{
									fontSize: 16,
									fontFamily: 'Inter-Regular',
								}}>{rootStore.userSetting.reminderTime.hour} : {rootStore.userSetting.reminderTime.minute}</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
				<View style={{
					paddingVertical: 16,
					borderBottomWidth: 1,
					borderBottomColor: '#EEEEEE'
				}}>
					<View style={{
						paddingHorizontal: 16
					}}>
						<Text style={{
							fontSize: 16,
							fontFamily: 'Inter-SemiBold',
							paddingBottom: 8,
							color: '#282828'
						}}>Privacy</Text>
						<View style={{
							flexDirection: 'row',
							justifyContent: 'space-between',
							alignItems: 'center',
						}}>
							<View style={{
								paddingBottom: 8
							}}>
								<Text style={{
									fontSize: 16,
									fontFamily: 'Inter-Regular',
									color: '#282828'
								}}>PIN</Text>
							</View>
							<View>
								<Switch value={this._switchState} onValueChange={this.switchOnPress} />
							</View>
						</View>
					</View>
				</View>
				<View style={{
					paddingVertical: 16,
					borderBottomWidth: 1,
					borderBottomColor: '#EEEEEE'
				}}>
					<View style={{
						paddingHorizontal: 16
					}}>
						<Text style={{
							fontSize: 16,
							fontFamily: 'Inter-SemiBold',
							paddingBottom: 8,
							color: '#282828'
						}}>About</Text>
						<View style={{
							flexDirection: 'row',
							justifyContent: 'space-between',
							alignItems: 'center',
						}}>
							<View style={{
								paddingBottom: 8
							}}>
								<Text style={{
									fontSize: 16,
									fontFamily: 'Inter-Regular',
									color: '#282828'
								}}>Our Story</Text>
							</View>
						</View>
					</View>
				</View>
				<View style={{
					paddingVertical: 16,
					borderBottomWidth: 1,
					borderBottomColor: '#EEEEEE'
				}}>
					<View style={{
						paddingHorizontal: 16
					}}>
						<Text style={{
							fontSize: 16,
							fontFamily: 'Inter-SemiBold',
							paddingBottom: 8,
							color: '#282828'
						}}>Account</Text>
						<View style={{
							flexDirection: 'row',
							justifyContent: 'space-between',
							alignItems: 'center',
						}}>
							<View style={{
								paddingBottom: 8
							}}>
								<Text style={{
									fontSize: 16,
									fontFamily: 'Inter-Regular',
									color: '#282828'
								}}>Logout</Text>
							</View>
						</View>
					</View>
				</View>
			</ScrollView>
		)
	}
}

const SettingNavigator = createStackNavigator({
	Setting: SettingScreen,
	SetupPin: SetupPin
}, {
	defaultNavigationOptions: {
    headerStyle: {
      elevation: 0,
      shadowOpacity: 0,
      // borderBottomWidth: 1,
      // borderBottomColor: '#EEEEEE'
    },
  },
})

SettingNavigator.navigationOptions = ({ navigation }) => {
  let tabBarVisible = true
  if (navigation.state.index > 0) {
    tabBarVisible = false
  }

  return {
    tabBarVisible,
  }
}

export default SettingNavigator