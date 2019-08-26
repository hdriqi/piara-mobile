import React from 'react'
import Root from './src/Root'

if (!__DEV__) {
  console.log = () => {}
}

const App = () => {
  return (
    <Root/>
  )
};

export default App