import { observable, toJS, computed, action } from 'mobx'
import uid from '../utils/uid'

// schema
// id: String
// name: String
// iconURI: String

class MoodStore {
  @observable list = [
		{
			name: 'terrible',
		},
		{
			name: 'sad',
		},
		{
			name: 'okay',
		},
		{
			name: 'happy',
		},
		{
			name: 'excited'
		}
	]

	getMoodByIndex(idx) {
		return toJS(this.list[idx])
	}
}


const moodStore = new MoodStore()
export default moodStore