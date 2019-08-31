import React, { Component } from 'react'
import { Text, View, SectionList, Button, Alert } from 'react-native'
import relationStore from '../../mobx/relationStore'
import { ScrollView, TouchableOpacity, TouchableWithoutFeedback } from 'react-native-gesture-handler'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { observer } from 'mobx-react'
import { observable, toJS } from 'mobx'

import { Input, Header } from 'react-native-elements'
import rootStore from '../../mobx/rootStore'
import { capitalize } from '../../utils/text'

@observer
class RelationIcon extends Component {
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
class AddRelation extends Component {
	@observable _inputRelationName = ''
	@observable _inputRelationIcon = ''

	constructor(props) {
		super(props)

		this._addRelation = this._addRelation.bind(this)
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
            letterSpacing: -0.3
          }}>Add Relation</Text>
        </View>
      ),
      headerRight: (
        <TouchableOpacity
					onPress={navigation.getParam('_addRelation')}
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
			_addRelation: this._addRelation
		 })
	}

	async _addRelation() {
		if(this._inputRelationName.length > 0 && this._inputRelationIcon.length > 0) {
			relationStore.addRelation({
				name: this._inputRelationName,
				icon: this._inputRelationIcon
			})
			this.props.navigation.navigate('ManageRelation')
		}
		else {
			Alert.alert('Failed to Add Relation', 'Relation name and icon is required')
		}
	}

	_setCurrentIcon(name) {
		this._inputRelationIcon = name
	}

	_getCurrentIcon() {
		return toJS(this._inputRelationIcon)
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
					placeholder='Relation Name'
					onChangeText={(text) => this._inputRelationName = text} 
					value={this._inputRelationName}
				/>
				<SectionList
					style={{
						padding: 16
					}}
					renderItem={({item, index, section}) => {
						return (
							<RelationIcon item={item} setCurrentIcon={this._setCurrentIcon.bind(this)} getCurrentIcon={this._getCurrentIcon.bind(this)} />
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

export default AddRelation
