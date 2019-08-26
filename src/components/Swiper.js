import PropTypes from "prop-types"
import React, { Component } from "react"
import { Dimensions, ScrollView } from "react-native"

const viewport = Dimensions.get("window")

export class Swiper extends Component {
  constructor(props) {
    super(props)
    this._viewport = viewport
    this._swiper = null
    this._itemWidth = this.props.itemWidth
    this._itemCenter = this.props.itemWidth / 2
    this._viewportCenter = this._viewport.width / 2
    this._momentumScrolling = false
    this._onPressScrolling = false
    this._touchEndTimeout = null
    this.state = {
      prevScrollX: 0,
      prevScrollY: 0,
      currentScrollX: 0,
      currentScrollY: 0,
      activeIndex: this.props.firstItem || 0
    }
    this._scrollToIndex = this._scrollToIndex.bind(this)
    this._handleScroll = this._handleScroll.bind(this)
    this.toggleOnPress = this.toggleOnPress.bind(this)
    this.scrollTo = this.scrollTo.bind(this)
  }

  componentDidMount() {
    this._scrollToIndex(this.props.firstItem, false)
  }

  componentDidUpdate(prevProps, prevState) {
    const prevChildrenKey = prevProps.children.map(c => c.key)
    const currentChildrenKey = this.props.children.map(c => c.key)
    if (prevChildrenKey.join(",") !== currentChildrenKey.join(",")) {
      this._scrollToIndex(this.props.firstItem, false)
    }
  }

  async _scrollToIndex(index, animated) {
    const offsetX = Math.round(this._itemWidth) * index
    if (index !== this.state.prevActiveIndex) {
      this.cbActiveIndexChange(index)
    }
    this.setState({
      prevActiveIndex: index
    })
    setTimeout(() => this._swiper.scrollTo({ x: offsetX, y: 0, animated: animated }), 250)
  }

  async _handleScroll(event) {
    const scrollX = event.nativeEvent.contentOffset.x
    const scrollY = event.nativeEvent.contentOffset.y
    const index = Math.round(scrollX / this._itemWidth)
    this.cbScrollChange(index)
    this.setState({
      currentScrollX: scrollX,
      currentScrollY: scrollY,
      activeIndex: index
    })
  }

  async cbActiveIndexChange(index) {
    this.props.onActiveIndexChange(index)
  }

  async cbScrollChange(index) {
    this.props.onScrollChange(index)
  }

  async getActiveIndex() {
    return this.state.activeIndex
  }

  async scrollTo(index, animated = true) {
    this._scrollToIndex(index, animated)
  }

  async toggleOnPress() {
    this._onPressScrolling = !this._onPressScrolling
  }

  render() {
    return (
      <ScrollView
        ref={c => (this._swiper = c)}
        scrollEventThrottle={16}
        horizontal={true}
        onScroll={this._handleScroll}
        snapToInterval={this.props.itemWidth}
        snapToAlignment={"center"}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: this._viewportCenter - this._itemCenter,
          zIndex: 5
        }}
        decelerationRate={"fast"}
        onTouchEnd={() => {
          clearTimeout(this._touchEndTimeout)
          this._touchEndTimeout = setTimeout(() => {
            if(!(this._momentumScrolling || this._onPressScrolling)) {
              this._scrollToIndex(this.state.activeIndex, true)
            }
            this._onPressScrolling = false
          }, 250)
        }}
        onMomentumScrollBegin={() => {
          this._momentumScrolling = true
        }}
        onMomentumScrollEnd={() => {
          this._momentumScrolling = false
          this._scrollToIndex(this.state.activeIndex, true)
        }}
      >
        {React.Children.map(this.props.children, child => {
          return React.cloneElement(child, {
            scrollTo: this.scrollTo,
            activeIndex: this.state.activeIndex,
            itemWidth: this.props.itemWidth,
            toggleOnPress: this.toggleOnPress
          })
        })}
      </ScrollView>
    )
  }
}

Swiper.defaultProps = {
  data: [],
  itemWidth: viewport.width,
  onActiveIndexChange: () => {},
  onScrollChange: () => {}
}

Swiper.propTypes = {
  data: PropTypes.array.isRequired,
  itemWidth: PropTypes.number.isRequired,
  onActiveIndexChange: PropTypes.func,
  onScrollChange: PropTypes.func
}

export default Swiper
