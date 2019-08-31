import React, { Component } from 'react'
import { Text, View, Button } from 'react-native'
import { TouchableWithoutFeedback, ScrollView, TouchableOpacity } from 'react-native-gesture-handler'
import { observer } from 'mobx-react'

import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import relationStore from '../../mobx/relationStore'

@observer
class ManageRelation extends Component {
	constructor(props) {
		super(props)
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
          }}>Manage Relation</Text>
        </View>
      ),
      headerRight: (
        <TouchableOpacity
          onPress={() => navigation.navigate('AddRelation')}
          style={{
            padding: 8
          }}
        >
          <Icon size={28} name="plus" />
        </TouchableOpacity>
      ),
    }
  }
	
	render() {
		return (
			<ScrollView style={{
				paddingVertical: 16,
				paddingHorizontal: 16
			}}>
				{
					relationStore.list.map((item) => {
						return (
							<View style={{
								flexDirection: 'row',
								justifyContent: 'space-between',
								paddingBottom: 12
							}} key={item.id}>
								<View style={{
									flexDirection: 'row',
									alignItems: 'center',
								}}>
									<View style={{
										paddingRight: 8
									}}>
										<Icon size={24} name={item.icon} />
									</View>
									<View>
										<Text style={{
											fontFamily: 'Inter-Medium',
											fontSize: 16
										}}>{ item.name }</Text>
									</View>
								</View>
								<View>
									<TouchableOpacity
										onPress={() => relationStore.remove(item.id)}
									>
										<Text style={{
											fontFamily: 'Inter-Regular',
											fontSize: 16,
											color: '#5388d0',
											letterSpacing: -.5
										}}>Remove</Text>
									</TouchableOpacity>
								</View>
							</View>
						)
					})
				}
			</ScrollView>
		)
	}
}

export default ManageRelation