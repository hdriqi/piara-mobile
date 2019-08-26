import React, { Component } from 'react'
import { Text, View, SectionList, Button, Alert } from 'react-native'
import activityStore from '../../mobx/activityStore'
import { ScrollView, TouchableOpacity, TouchableWithoutFeedback } from 'react-native-gesture-handler'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { observer } from 'mobx-react'
import { observable, toJS } from 'mobx'

import { Input, Header } from 'react-native-elements'
import rootStore from '../../mobx/rootStore'
import { capitalize } from '../../utils/text'

@observer
class ActivityIcon extends Component {
	render() {
		return (
			<View style={{
				flexDirection: 'row',
				marginBottom: 16
			}}>
				{
					this.props.item.map((name) => {
						const isActive = this.props.getCurrentIcon() === name
						return (
							<View style={{
								width: '25%',
								alignItems: 'center',
								padding: 12,
								opacity: isActive ? 1 : 0.4
							}} key={name}>
								<TouchableWithoutFeedback
									onPress={() => this.props.setCurrentIcon(name)}
								>
									<Icon size={28} name={name} />
								</TouchableWithoutFeedback>
							</View>
						)
					})
				}
			</View>
		)
	}
}

@observer
class AddActivity extends Component {
	@observable _inputActivityName = ''
	@observable _inputActivityIcon = ''

	constructor(props) {
		super(props)

		this._addActivity = this._addActivity.bind(this)
	}

	static navigationOptions = ({ navigation }) => {
    return {
      headerLeft: (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
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
          }}>Add Activity</Text>
        </View>
      ),
      headerRight: (
        <TouchableOpacity
					onPress={navigation.getParam('_addActivity')}
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
			_addActivity: this._addActivity
		})
	}

	async _addActivity() {
		if(this._inputActivityName.length > 0 && this._inputActivityIcon.length > 0) {
			activityStore.addActivity({
				name: this._inputActivityName,
				icon: this._inputActivityIcon
			})
			this.props.navigation.navigate('ManageActivity')
		}
		else {
			Alert.alert('Failed to Add Activity', 'Activity name and icon is required')
		}
	}

	_setCurrentIcon(name) {
		this._inputActivityIcon = name
	}

	_getCurrentIcon() {
		return toJS(this._inputActivityIcon)
	}

	_iconListChunk(arr, size) {
		return arr.reduce((chunks, el, i) => {
			if (i % size === 0) {
				chunks.push([el])
			} else {
				chunks[chunks.length - 1].push(el)
			}
			return chunks
		}, [])
	}

	render() {
		const sections = rootStore.iconList.map((list) => {
			return {
				title: list.title,
				data: this._iconListChunk(list.data, 4)
			}
		})
		return (
			<View>
				<Input
					style={{
						fontFamily: 'Inter-Medium'
					}}
					placeholder='Activity Name'
					onChangeText={(text) => this._inputActivityName = text} 
					value={this._inputActivityName}
				/>
				<SectionList
					style={{
						padding: 16
					}}
					renderItem={({item, index, section}) => {
						return (
							<ActivityIcon item={item} setCurrentIcon={this._setCurrentIcon.bind(this)} getCurrentIcon={this._getCurrentIcon.bind(this)} />
						)
					}}
					renderSectionHeader={({section: {title}}) => (
						<Text style={{
              fontSize: 16,
              fontFamily: 'Inter-Bold',
							letterSpacing: -.5,
							textAlign: 'center',
							paddingBottom: 8
            }}>{capitalize(title)}</Text>
					)}
					sections={sections}
					keyExtractor={(item, index) => item + index}
				/>
			</View>
		)
	}
}

export default AddActivity
