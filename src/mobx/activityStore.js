import { observable, toJS, action } from 'mobx'
import uid from '../utils/uid'
import AsyncStorage from '@react-native-community/async-storage'

// schema
// id: String
// name: String
// iconURI: String

class ActivityStore {
  @observable list = []
  @observable index = {
		id: {}
	}

	@action
	async fetchInitialActivity() {
		const currentList = await AsyncStorage.getItem('my-activity')
		const parsedCurrentList = JSON.parse(currentList)
		if(Array.isArray(parsedCurrentList)) {
			this.list = parsedCurrentList
		}
	}

	/**
	 * 
	 * @param {name, icon} activity 
	 */
	@action
  async addActivity({name, icon}) {
		const id = uid.generate()
		this.index.id[id] = this.list.length
    this.list.push({
			id,
			name,
			icon
		})
		await AsyncStorage.setItem('my-activity', JSON.stringify(this.list))
	}

	remove(id) {
		const idx = this.list.findIndex((activity) => activity.id === id)
		if(idx > -1) {
			this.list.splice(idx, 1)
		}
	}

	getActivityById(id) {
		return toJS(this.list[this.index.id[id]])
	}
}


const activityStore = new ActivityStore()
export default activityStore