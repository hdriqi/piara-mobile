/**
 * 
 * @param {String} str 
 */
const capitalize = (str) => {
	if(str) {
		return str.charAt(0).toUpperCase() + str.slice(1)
	}
	else {
		return ``
	}
}

export {
	capitalize
}

export default {
	capitalize
}