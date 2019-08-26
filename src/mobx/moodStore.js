import { observable, toJS, computed, action } from 'mobx'
import uid from '../utils/uid'

// schema
// id: String
// name: String
// iconURI: String

class MoodStore {
  @observable list = [
		{
			name: 'Terrible',
		},
		{
			name: 'Sad',
		},
		{
			name: 'Okay',
		},
		{
			name: 'Happy',
		},
		{
			name: 'Excited'
		}
	]

	getMoodByIndex(idx) {
		return toJS(this.list[idx])
	}
}


const moodStore = new MoodStore()
export default moodStore