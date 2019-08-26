import React, { Component } from 'react'
import { Text, View } from 'react-native'
import { observer } from 'mobx-react'
import { observable } from 'mobx'
import { TouchableOpacity } from 'react-native-gesture-handler'

const styles = {
	pinButtonContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 15,
	},
	pinButton: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		borderColor: 'black',
		width: 60,
		height: 60,
		borderRadius: 60/2,
		borderWidth: 1,
	}
}

@observer
export class Pin extends Component {
	@observable _pin = []
	@observable _state = 'enter'
	
	constructor(prop) {
		super(prop)
		this._onPinPress = this._onPinPress.bind(this)
		this._onPinDelete = this._onPinDelete.bind(this)
	}

	async _onPinPress(val) {
		if(this._pin.length < this.props.pinLength) {
			this._pin.push(val)
		}
		if(this._pin.length === this.props.pinLength) {
			this.props.onPinCompleted(this._pin.join(''))
		}
	}

	async _onPinDelete() {
		this._pin.pop()
	}

	render() {
		return (
			<View style={{
				flex: 1,
				paddingHorizontal: 45
			}}>
				<View style={{
					paddingVertical: 30,
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'center'
				}}>
					{
						[1,2,3,4].map((pin) => {
							return (
								<View style={{
									width: 20,
									height: 20,
									margin: 5,
									borderRadius: 20/2,
									borderWidth: 1,
									backgroundColor: pin <= this._pin.length ? 'red' : 'white'
								}} key={pin}>
								</View>
							)
						})
					}
				</View>
				{
					[0,1,2,3].map((row) => {
						return (
							<View style={{
								height: 90,
								flexDirection: 'row',
							}} key={row}>
								{
									[1 + row * 3,2 + row * 3,3 + row * 3].map((col) => {
										if(col == 10) {
											return (
												<View style={styles.pinButtonContainer} key={col}></View>
											)
										}
										else if(col == 12) {
											return (
												<View style={styles.pinButtonContainer} key={col}>
													<TouchableOpacity
														style={{
															width: '100%',
															height: '100%'
														}}
														onPress={() => this._onPinDelete(col)}
													>
														<View style={styles.pinButton}>
															<Text style={{
																fontSize: 18
															}}>DEL</Text>
														</View>
													</TouchableOpacity>
												</View>
											)
										}
										else {
											if(col == 11) {
												col = 0
											}
											return (
												<View style={styles.pinButtonContainer} key={col}>
													<TouchableOpacity
														style={{
															width: '100%',
															height: '100%'
														}}
														onPress={() => this._onPinPress(col)}
													>
														<View style={styles.pinButton}>
															<Text style={{
																fontSize: 18
															}}>{col}</Text>
														</View>
													</TouchableOpacity>
												</View>
											)
										}
									})
								}
							</View>
						)
					})
				}
			</View>
		)
	}
}

export default Pin