import { observable, toJS, action } from 'mobx'
import uid from '../utils/uid'
import AsyncStorage from '@react-native-community/async-storage'
import RNBlockstackSdk from "react-native-blockstack"

class LogStore {
  @observable list = []
  @observable activeLog = null
  @observable inputLog = {
    mood: {},
    relationList: [],
    activityList: [],
    date: null,
    month: null,
    year: null,
  }

  constructor() {
    this._defaultInputLog = {
      mood: {
        name: 'okay',
        value: 2
      },
      relationList: [],
      activityList: [],
      date: null,
      month: null,
      year: null,
    }
  }

  @action
	async fetchInitialLog() {
    const dId = await AsyncStorage.getItem('decentralizedId')
    const currentList = await AsyncStorage.getItem(`${dId}-log`)
    try {
      const parsedCurrentList = JSON.parse(currentList)
      if(Array.isArray(parsedCurrentList)) {
        this.list = parsedCurrentList
      }
    } catch (err) {
      this.list = []
    }
  }
  
  @action
  async clearInputLog() {
    this.inputLog = this._defaultInputLog
  }

  @action
  async saveLog() {
    const id = uid.generate()
    const data = this.inputLog
    const key = `${data.year}-${data.month}-${data.date}`
    const dataExist = this.list.findIndex((el) => el.key === key)
    console.log(toJS(data))
    if(dataExist > -1) {
      this.list[dataExist] = {
        id,
        key,
        ...data
      }
    }
    else {
      this.list.push({
        id,
        key,
        ...data
      })
    }
    
    const dId = await AsyncStorage.getItem('decentralizedId')
    await AsyncStorage.setItem(`${dId}-log`, JSON.stringify(this.list))
  }

  @action
  async backupList() {
    const dId = await AsyncStorage.getItem('decentralizedId')
    await RNBlockstackSdk.putFile(`${dId}-log`, JSON.stringify(this.list), {
      encrypt: true
    })
  }

  @action
  async restoreList() {
    const dId = await AsyncStorage.getItem('decentralizedId')
    const restoredList = await RNBlockstackSdk.getFile(`${dId}-log`, {
      decrypt: true
    })
    this.list = restoredList
  }

  setActiveLog(key) {
    this.activeLog = key
  }

  getLogList() {
    return toJS(this.list)
  }

  getLogByKey(key) {
    return this.list.find((item) => item.key === key)
  }
}


const logStore = new LogStore()
export default logStore