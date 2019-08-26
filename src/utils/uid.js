class Uid {
	constructor() {
		this.last = null
	}

	_now() {
		const time = Date.now()
		this.last = this.last || time
		return this.last = time > this.last ? time : this.last + 1
	}

	generate() {
		return this._now().toString(36)
	}
}

const uid = new Uid()
export default uid