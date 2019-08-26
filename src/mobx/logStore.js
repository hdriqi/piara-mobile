import { observable, toJS, action } from 'mobx'
import uid from '../utils/uid'
import AsyncStorage from '@react-native-community/async-storage';

// schema
// id: String
// key: String
// mood: Mood
// activityList: [Activity]
// relationList: [Relation]
// day: Number
// month: Number
// year: Number

class LogStore {
  @observable list = [
    {
      id: '123123123',
      key: '2019-8-17',
      mood: {
        name: 'Okay'
      },
      activityList: [
        {
          name: 'Work',
          icon: 'worker'
        },
        {
          name: 'Competition',
          icon: 'trophy'
        },
        {
          name: 'Gaming',
          icon: 'controller-classic'
        },
        {
          name: 'Movie',
          icon: 'movie'
        },
      ],
      day: 17,
      month: 8,
      year: 2019
    },
    {
      id: '123123123',
      key: '2019-8-18',
      mood: {
        name: 'Terrible'
      },
      activityList: [
        {
          name: 'Work',
          icon: 'worker'
        },
        {
          name: 'Competition',
          icon: 'trophy'
        },
        {
          name: 'Work',
          icon: 'worker'
        },
        {
          name: 'Competition',
          icon: 'trophy'
        },
      ],
      day: 18,
      month: 8,
      year: 2019
    },
    {
      id: '123123123',
      key: '2019-8-16',
      mood: {
        name: 'Excited'
      },
      activityList: [
        {
          name: 'Work',
          icon: 'worker'
        },
        {
          name: 'Competition',
          icon: 'trophy'
        },
        {
          name: 'Work',
          icon: 'worker'
        },
        {
          name: 'Competition',
          icon: 'trophy'
        },
      ],
      day: 16,
      month: 8,
      year: 2019
    }
  ]
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
      mood: {},
      relationList: [],
      activityList: [],
      date: null,
      month: null,
      year: null,
    }
  }

  @action
	async fetchInitialLog() {
    const currentList = await AsyncStorage.getItem('my-log')
    try {
      const parsedCurrentList = JSON.parse(currentList)
      if(Array.isArray(parsedCurrentList)) {
        this.list = parsedCurrentList
      } 
    } catch (err) {
      
    }
	}

  @action
  async saveLog() {
    const id = uid.generate()
    const data = this.inputLog
    const key = `${data.year}-${data.month}-${data.date}`
    const dataExist = this.list.findIndex((el) => el.key === key)
    console.log(data)
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
    
    await AsyncStorage.setItem(`my-log`, JSON.stringify(this.list))
    this.inputLog = this._defaultInputLog
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