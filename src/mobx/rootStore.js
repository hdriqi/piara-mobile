import { observable, toJS, action } from 'mobx'
import AsyncStorage from '@react-native-community/async-storage'

class RootStore {
	@observable userSetting = {}
	@observable companion = {}
	@observable iconList = [
		{
			title: 'activity',
			data: ["audio-video", "axe", "basketball", "bed empty", "biathlon", "bike", "billiards", "border-color", "bowling", "boxing-glove", "box-cutter", "briefcase", "broom", "brush", "bible", "buddhism", "camera", "cards", "cart", "cetltic-cross", "chess-knight", "chemical", "chef-hat", "christianity", "circular-saw", "compass", "controller-classic", "desktop-tower-monitor", "diving-snorkel", "flask-outline", "flower", "football", "guitar-accoustic", "hammer", "hand-saw", "headphones", "hinduism", "hiking", "hotel", "islam", "itunes", "instagram", "judaism", "library", "linkedin", "facebook", "map", "medal", "medical-bag", "microphone", "movie", "music", "needle", "podcast", "school", "spray", "stamper", "stethoscope", "phone", "piano", "pickaxe", "racquetball", "radio", "radioactive", "run", "saxophone", "shower-head", "silverware", "sleep", "swim", "sword-cross", "tablet-cellphone", "television", "tennis", "toilet", "toolbox", "twitter", "umbrella", "video-vintage", "volleyball", "walk", "whatssapp", "youtube"]
		},
		{
			title: 'people',
			data: ["account-switch", "artist", "baby", "brain", "charity", "doctor", "ghost", "glass", "hail", "hand", "hand-peace", "hand-pointing-up", "heart", "heart-broken", "human-male-female", "human-male", "human-female", "human-female-female", "human-male-male", "human-female-girl", "human-male-girl", "human-pregnant", "human-male-boy", "mother-nurse", "worker"]
		},
		{
			title: 'food',
			data: ["beer", "blender", "bowl", "bread-slice", "cake", "candycane", "cannabis", "carrot", "chili-mild", "coffee", "cup", "cupcake", "egg", "elephant", "food", "food-apple", "food-croissant", "food-for-drink", "food-variant", "glass-mug", "glass-wine", "grill", "hamburger", "ice-cream", "mushroom", "pill", "pizza", "popcorn", "pumpkin", "rice", "sausage ", "smoking", "stove", "tea", "tor"]
		},
		{
			title: 'transportation',
			data: ["airplane", "airballoon", "ambulance", "bus", "car", "car-sport", "caravan", "ferry", "fire-truck", "forklift", "gokart", "motorbike", "taxi", "tractor", "towing", "train", "truck", "van-passenger", "van-utility"]
		}
	]

	@action
	async fetchInitialSetting() {
		const setting = await AsyncStorage.getItem('userSetting')
		try {
			if(!setting) {
				throw "Invalid JSON"
			}
			this.userSetting = JSON.parse(setting)
		} catch (err) {
			this.userSetting = {
				pin: '',
				selectedCompanion: 'cat',
				reminder: false,
				reminderTime: {
					hour: `20`,
					minute: `00`,
				}
			}
			await AsyncStorage.setItem('userSetting', JSON.stringify(this.userSetting))
		}

		const cat = await AsyncStorage.getItem('companion-cat')
		try {
			if(!cat) {
				throw "Invalid JSON"
			}
			this.companion.cat = JSON.parse(cat)
		} catch (err) {
			const response = await fetch('https://jsonstorage.net/api/items/59cf78fd-2561-417e-828b-239ee0685859')
			const cat = await response.json()
			this.companion.cat = cat
			await AsyncStorage.setItem('companion-cat', JSON.stringify(this.companion.cat))
		}
	}

	@action
	async setPIN(val) {
		this.userSetting.pin = val
		await AsyncStorage.setItem('userSetting', JSON.stringify(toJS(this.userSetting)))
	}

	@action
	async setReminder(val) {
		this.userSetting.reminder = val
		await AsyncStorage.setItem('userSetting', JSON.stringify(toJS(this.userSetting)))
	}

	@action
	async setReminderTime({hour, minute}) {
		this.userSetting.reminderTime = {
			hour: hour,
			minute: minute
		}
		await AsyncStorage.setItem('userSetting', JSON.stringify(toJS(this.userSetting)))
	}
}


const rootStore = new RootStore()
export default rootStore