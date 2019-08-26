const listMonth = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"]

/**
 * 
 * @param {Int} day 
 * @param {Int} month 
 * @param {Int} year 
 */
const getDayName = (day, month, year) => {
  var weekdays = new Array(7)
  weekdays[0] = "sun"
  weekdays[1] = "mon"
  weekdays[2] = "tue"
  weekdays[3] = "wed"
  weekdays[4] = "thu"
  weekdays[5] = "fri"
  weekdays[6] = "sat"
  return weekdays[new Date(`${month + 1}/${day}/${year}`).getDay()]
}

/**
 * 
 * @param {Int} month 
 * @param {Int} year 
 */
const getTotalDaysInMonth = (month, year) => {
	return new Date(year, month + 1, 0).getDate()
}

const _monthDiff = (month, year) => {
	let months = (year.to - year.from) * 12
	months -= month.from
	months += month.to
	return months <= 0 ? 0 : months
}

const getMonthIdx = (name) => {
	return listMonth.indexOf(name.toLowerCase())
}

const getMonthName = (idx) => {
	return listMonth[idx]
}

const getPickerData = () => {
	const currentMonth = new Date().getMonth()
	const currentYear = new Date().getFullYear()
	const monthPassed = _monthDiff({
		from: 0,
		to: currentMonth
	}, {
		from: 2019,
		to: currentYear
	})
	// monthPassed + currentPassed
	const months = monthPassed + 1

	return Array(months).fill().map((v, i) => {
		const monthIdx = i % 12
		const yearIdx = Math.floor(i/12)
		return {
			month: monthIdx ,
			year: 2019 + yearIdx
		}
	})
}


export {
	getDayName,
	getTotalDaysInMonth,
	getPickerData,
	getMonthName,
	getMonthIdx
}

export default {
	getDayName,
	getTotalDaysInMonth,
	getPickerData,
	getMonthName,
	getMonthIdx
}