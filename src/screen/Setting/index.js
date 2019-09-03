import React, { Component } from 'react'
import { Text, View, Switch, Alert } from 'react-native'
import { createStackNavigator } from 'react-navigation'
import SetupPin from './SetupPin'
import { NavigationEvents } from 'react-navigation'
import rootStore from '../../mobx/rootStore'
import { observer } from 'mobx-react'
import { observable } from 'mobx'
import Picker from 'react-native-picker'
import { TouchableOpacity, ScrollView } from 'react-native-gesture-handler'
import PushNotification from 'react-native-push-notification'
import Modal from "react-native-modal"

@observer
export class SettingScreen extends Component {
	@observable _switchState = null
	@observable _switchReminder = null
	@observable _isLoading = false

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
            fontSize: 24,
            letterSpacing: -0.3
          }}>Setting</Text>
        </View>
      )
    }
	}
	
	async _scheduleReminder(selectedHour, selectedMinute) {
		const currentTime = new Date()
		let currentYear = currentTime.getFullYear()
		let currentMonth = currentTime.getMonth() + 1
		let currentDate = currentTime.getDate()
		if(currentTime.getHours() >= selectedHour && currentTime.getMinutes() > selectedMinute) {
			currentDate++
		}
		const scheduleTime = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${currentDate.toString().padStart(2, '0')}T${selectedHour}:${selectedMinute}:00Z`
		const parsedTime = new Date(Date.parse(scheduleTime) + new Date().getTimezoneOffset() * 60000)
		console.log(parsedTime)
		PushNotification.cancelAllLocalNotifications()
		PushNotification.localNotificationSchedule({
			title: "How's Your Day?", // (optional)
			message: "Fill your daily mood to understand yourself and reflect your emotional state", // (required)
			date: parsedTime,
			repeatType: 'day',
			playSound: true,
			soundName: 'default',
		})
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

				if(this._switchReminder) {
					this._scheduleReminder(selectedHour, selectedMinute)
				}
			}
		})
	}

	async _switchReminderOnPress(val) {
		this._switchReminder = val
		await rootStore.setReminder(val)
		if(val) {
			const selectedHour = rootStore.userSetting.reminderTime.hour
			const selectedMinute = rootStore.userSetting.reminderTime.minute
			this._scheduleReminder(selectedHour, selectedMinute)
		}
		else {
			PushNotification.cancelAllLocalNotifications()
		}
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

	async _backupData() {
		this._isLoading = true
		try {
			await rootStore.backupData()
			Alert.alert('Backup Successful', 'Your data has been encrypted and succesfully saved in the cloud!')
		} catch (err) {
			Alert.alert('Backup Failed', 'Please check your internet connection')
		}
		this._isLoading = false
	}

	async _logOut() {
		await rootStore.logOut()
		this.props.navigation.navigate('SignIn', {
			prevRoute: 'logOut'
		})
	}

	async _confirmRestoreData() {
		this._isLoading = true
		try {
			await rootStore.restoreData()	
			Alert.alert('Restore Successful', 'Your data has been restored successfully!')
		} catch (err) {
			Alert.alert('Restore Failed', 'Please check your internet connection')
		}
		this._isLoading = false
	}

	async _restoreData() {
		Alert.alert(
			'Are you sure you want to restore data from your backup?',
			'Your current local data will be replaced with the latest data in the cloud',
			[
				{
					text: 'Cancel',
					style: 'cancel',
				},
				{text: 'OK', onPress: () => this._confirmRestoreData()},
			],
			{cancelable: false},
		)
		
	}

	render() {
		return (
			<ScrollView>
				<NavigationEvents
					onWillFocus={payload => {
						this._init()
					}}
				/>
				<Modal isVisible={this._isLoading}>
					<View style={{ 
						flex: 1,
						justifyContent: 'center'
					}}>
            <Text style={{
							color: 'white',
							fontFamily: 'Inter-SemiBold',
							fontSize: 16,
							textAlign: 'center'
						}}>Loading...</Text>
          </View>
				</Modal>
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
							color: '#3C3C3C',
							letterSpacing: -0.3
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
									fontFamily: 'Inter-Regular',
									fontSize: 16,
									color: `#777777`,
									letterSpacing: -0.3
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
									fontFamily: 'Inter-Regular',
									fontSize: 16,
									color: `#777777`,
									letterSpacing: -0.3
								}}>Time</Text>
							</View>
							<TouchableOpacity
								onPress={() => Picker.show()}
							>
								<Text style={{
									fontFamily: 'Inter-Regular',
									fontSize: 16,
									color: `#3C3C3C`,
									letterSpacing: -0.3
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
						}}>Data</Text>
						<View style={{
							flexDirection: 'row',
							justifyContent: 'space-between',
							alignItems: 'center',
						}}>
							<TouchableOpacity
								onPress={() => this._backupData()}
							>
								<View style={{
									paddingBottom: 8
								}}>
									<Text style={{
										fontSize: 16,
										fontFamily: 'Inter-Regular',
										color: '#7DABC9'
									}}>Backup</Text>
								</View>
							</TouchableOpacity>
						</View>
						<View style={{
							flexDirection: 'row',
							justifyContent: 'space-between',
							alignItems: 'center',
						}}>
							<TouchableOpacity
								onPress={() => this._restoreData()}
							>
								<View style={{
									paddingBottom: 8
								}}>
									<Text style={{
										fontSize: 16,
										fontFamily: 'Inter-Regular',
										color: '#7DABC9'
									}}>Restore</Text>
								</View>
							</TouchableOpacity>
						</View>
						{/* <View style={{
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
						</View> */}
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
							color: '#3C3C3C',
							letterSpacing: -0.3
						}}>Account</Text>
						<View style={{
							flexDirection: 'row',
							justifyContent: 'space-between',
							alignItems: 'center',
						}}>
							<TouchableOpacity
								onPress={() => this._logOut()}
							>
								<View style={{
									paddingBottom: 8
								}}>
									<Text style={{
										fontFamily: 'Inter-Regular',
										fontSize: 16,
										color: `#7DABC9`,
										letterSpacing: -0.3
									}}>Logout</Text>
								</View>
							</TouchableOpacity>
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
      shadowOpacity: 0
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