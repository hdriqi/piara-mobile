import { observable, toJS, action } from 'mobx'
import uid from '../utils/uid'
import AsyncStorage from '@react-native-community/async-storage'
import RNBlockstackSdk from "react-native-blockstack"

// schema
// id: String
// name: String
// iconURI: String

class RelationStore {
	@observable defaultList = [{"id":"jzyxhvr2","name":"Hangout","icon":"coffee"},{"id":"jzyxiso6","name":"Partner","icon":"flower"},{"id":"jzyxjnxf","name":"Co-worker","icon":"worker"},{"id":"jzyxk75z","name":"Myself","icon":"brain"}]
  @observable list = []
  @observable index = {
		id: {}
	}

	@action
	async fetchInitialRelation() {
		const dId = await AsyncStorage.getItem('decentralizedId')
		const currentList = await AsyncStorage.getItem(`${dId}-relation`)
		const parsedCurrentList = JSON.parse(currentList)
		if(Array.isArray(parsedCurrentList) && parsedCurrentList.length > 0) {
			this.list = parsedCurrentList
		}
		else {
			this.list = this.defaultList
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
		const dId = await AsyncStorage.getItem('decentralizedId')
		await AsyncStorage.setItem(`${dId}-relation`, JSON.stringify(this.list))
	}

	@action
  async backupList() {
		const dId = await AsyncStorage.getItem('decentralizedId')
    await RNBlockstackSdk.putFile(`${dId}-relation`, JSON.stringify(this.list), {
      encrypt: true
    })
	}
	
	@action
  async restoreList() {
		const dId = await AsyncStorage.getItem('decentralizedId')
    await RNBlockstackSdk.getFile(`${dId}-relation`, {
      decrypt: true
    })
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