import React, { Component } from 'react'
import { Text, View, Button, Image } from 'react-native'
import Picker from 'react-native-picker'
import { observer } from 'mobx-react'
import { TouchableOpacity } from 'react-native-gesture-handler'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import Swiper from '../../components/Swiper'
import Day from '../../components/Day' 
import logStore from '../../mobx/logStore'
import rootStore from '../../mobx/rootStore'
import { observable, computed, transaction } from 'mobx'
import { getTotalDaysInMonth, getDayName, getPickerData, getMonthName, getMonthIdx } from '../../utils/date'
import { capitalize } from '../../utils/text'
import { NavigationEvents } from 'react-navigation';

@observer
class Home extends Component {
	@observable _activeKey = 0
	@observable _selectedMonth = new Date().getMonth()
	@observable _selectedYear = new Date().getFullYear()

	@computed get _selectedMonthDayList() {
		return [...Array(getTotalDaysInMonth(this._selectedMonth, this._selectedYear)).keys()].map((idx) => {
			return {
				dayName: getDayName(idx+1, this._selectedMonth, this._selectedYear),
				dayDate: idx + 1
			}
		})
	}

	constructor(props) {
		super(props)

		this._currentMonth = new Date().getMonth()
		this._firstItem = new Date().getDate() - 1
		this._pickerData = []
		this._swiperItemWidth = 56
		this._initPicker = this._initPicker.bind(this)
	}
	
	async _initPicker() {
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
					self._firstItem = self._currentMonth > self._selectedMonth ? getTotalDaysInMonth(self._selectedMonth, year) - 1 : new Date().getDate() - 1
				})
			}
		})
	}

	async _onScrollChange(index) {
		const activeKey = `${this._selectedYear}-${this._selectedMonth+1}-${index+1}`
		if(activeKey !== this._activeKey) {
			this._activeKey = activeKey
		}
	}

	render() {
		const activeLog = logStore.getLogByKey(this._activeKey)

		return (
			<View style={{ 
				flex: 1
			}}>
				<NavigationEvents
          onWillFocus={payload => {
            this._initPicker()
          }}
        />
				<View style={{
					flex: 1
				}}>
					<TouchableOpacity
						onPress={() => Picker.show()}
						style={{
							height: '100%',
							alignItems: 'center'
						}}
					>
						<View style={{
							flex: 1,
							flexDirection: 'row',
							alignItems: 'center'
						}}>
							<View>
								<Text style={{
									textAlign: 'center',
									fontSize: 24,
									fontFamily: 'Inter-Bold',
									fontWeight: 'bold',
									letterSpacing: -0.3
								}}>
									{capitalize(getMonthName(this._selectedMonth))} {this._selectedYear}
								</Text>
							</View>
							<View>
								<Icon name="chevron-down" size={24} />
							</View>
						</View>
					</TouchableOpacity>
				</View>
				<View style={{
					flex: 12
				}}>
					<Swiper
						onScrollChange={this._onScrollChange.bind(this)}
						itemWidth={this._swiperItemWidth}
						firstItem={this._firstItem}
					>
						{
							this._selectedMonthDayList.map((item, key) => {
								return (
									<Day item={item} index={key} key={`${this._selectedMonth}+${this._selectedYear}+${key}`}/>
								)
							})
						}
					</Swiper>
				</View>
				<View style={{
					flex: 1,
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0
				}}>
					<View style={{
						flex: 2
					}}>

					</View>
					<View style={{
						flex: 11
					}}>
						{
							activeLog ? (
								<View style={{
									flex: 1
								}}>
									<View style={{
										flex: 5,
										alignItems: 'center',
										justifyContent: 'center',
										padding: 16
									}}>
										<Image style={{
											width: '100%',
											height: '100%'
										}} source={{
											uri: rootStore.companion.cat[activeLog.mood.name.toLowerCase()]
										}} />
									</View>
									<View style={{
										flex: 1
									}}>
										<View style={{
											alignItems: 'center',
											justifyContent: 'center',
										}}>
											<Text style={{
												fontFamily: 'Inter-Regular',
												fontSize: 18
											}}>
												Feeling
												<Text style={{
													fontFamily: 'Inter-SemiBold',
													fontSize: 18
												}}> {activeLog.mood.name}</Text>
											</Text>
										</View>
									</View>
									<View style={{
										flex: 5
									}}>
										<View style={{
											flexDirection: 'row',
											flexWrap: 'wrap',
											justifyContent: 'space-evenly',
											alignItems: 'center',
											paddingHorizontal: 16
										}}>
											{
												Array.isArray(activeLog.activityList) && activeLog.activityList.map((activity) => {
													return (
														<View style={{
															alignItems: 'center',
															flexDirection: 'row',
															paddingVertical: 4,
															paddingHorizontal: 8,
															// backgroundColor: '#F8F8F8',
															borderRadius: 8,
															marginBottom: 8,
														}}>
															<View style={{
																paddingRight: 4
															}}>
																<Icon name={activity.icon} size={16} />
															</View>
															<View>
																<Text style={{
																	fontSize: 16,
																	fontFamily: 'Inter-Regular'
																}}>{activity.name}</Text>
															</View>
														</View>
													)
												})
											}
										</View>
										<View style={{
											flexDirection: 'row',
											flexWrap: 'wrap',
											justifyContent: 'space-evenly',
											alignItems: 'center',
											paddingHorizontal: 16
										}}>
											{
												Array.isArray(activeLog.relationList) && activeLog.relationList.map((activity) => {
													return (
														<View style={{
															alignItems: 'center',
															flexDirection: 'row',
															paddingVertical: 4,
															paddingHorizontal: 8,
															// backgroundColor: '#F8F8F8',
															borderRadius: 8,
															marginBottom: 8
														}}>
															<View style={{
																paddingRight: 4
															}}>
																<Icon name={activity.icon} size={16} />
															</View>
															<View>
																<Text style={{
																	fontSize: 16,
																	fontFamily: 'Inter-Regular'
																}}>{activity.name}</Text>
															</View>
														</View>
													)
												})
											}
										</View>
									</View>
									<View style={{
										flex: 1,
										alignItems: 'center',
										justifyContent: 'center'
									}}>
										<TouchableOpacity
											onPress={() => this.props.navigation.navigate('AddLog', {
												key: this._activeKey
											})}
										>
											<Text style={{
												fontFamily: 'Inter-Regular',
												fontSize: 16,
												color: '#5388d0',
												letterSpacing: -.5
											}}>Edit Data</Text>
										</TouchableOpacity>
									</View>
								</View>
							) : (
								<Button title="Add Log" onPress={() => this.props.navigation.navigate('AddLog', {
									key: this._activeKey
								})}/>
							)
						}
					</View>
				</View>
			</View>
		)
	}
}

export default Home