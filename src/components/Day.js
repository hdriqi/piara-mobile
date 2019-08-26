import React, { Component } from 'react'
import { StyleSheet, TouchableWithoutFeedback, View, Text } from 'react-native'
import PropTypes from 'prop-types'
import { capitalize } from '../utils/text';

const textStyle = {
  fontSize: 16,
  fontFamily: "bold",
  fontFamily: "Inter-Bold"
}

export default class Day extends Component { 
  constructor(props) {
    super(props)
  }

  render () {
    const isActive = this.props.activeIndex === this.props.index
    return (
      <View>
        <TouchableWithoutFeedback
          onPress={ () => {
            this.props.toggleOnPress()
            this.props.scrollTo(this.props.index)
          } }
        >
          <View style={{
            width: this.props.itemWidth,
            alignItems: "center",
            opacity: isActive ? 1 : 0.3,
            marginVertical: 8
          }}>
            <Text style={textStyle}>{ capitalize(this.props.item.dayName) }</Text>
            <Text style={textStyle}>{ this.props.item.dayDate }</Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
    )
  }
}