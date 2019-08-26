import { observable, toJS, action } from 'mobx'
import uid from '../utils/uid'
import AsyncStorage from '@react-native-community/async-storage'

// schema
// id: String
// name: String
// iconURI: String

class RelationStore {
  @observable list = []
  @observable index = {
		id: {}
	}

	@action
	async fetchInitialRelation() {
		const currentList = await AsyncStorage.getItem('my-relation')
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
  async addRelation({name, icon}) {
		const id = uid.generate()
		this.index.id[id] = this.list.length
    this.list.push({
			id,
			name,
			icon
		})
		await AsyncStorage.setItem('my-relation', JSON.stringify(this.list))
	}

	remove(id) {
		const idx = this.list.findIndex((activity) => activity.id === id)
		if(idx > -1) {
			this.list.splice(idx, 1)
		}
	}

	getRelationById(id) {
		return toJS(this.list[this.index.id[id]])
	}
}


const relationStore = new RelationStore()
export default relationStore