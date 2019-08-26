import React, { Component } from 'react'
import { Text, View } from 'react-native'
import Pin from '../../components/Pin'
import rootStore from '../../mobx/rootStore'

export class SetupPin extends Component {
	constructor(prop) {
		super(prop)
		this._onPinCompleted = this._onPinCompleted.bind(this)
	}

	async _onPinCompleted(pin) {
		rootStore.setPIN(pin)
		this.props.navigation.goBack()
	}
	
	render() {
		return (
			<View>
				<Text>Setup Pin</Text>
				<Pin onPinCompleted={this._onPinCompleted} pinLength={4} />
			</View>
		)
	}
}

export default SetupPin
