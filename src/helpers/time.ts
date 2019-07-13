import { Time, TimeInput, TimeOutput } from './types'

const TIME_PARSE_MERIDIEM = new RegExp(/^(\d{1,2}?):(\d{2}?)\s?(am|pm)$/i)
const TIME_PARSE_24 = new RegExp(/^(\d{1,2}?):(\d{2}?)$/)

const defaultTime = {
	hour: 12,
	minute: 30,
}

// parse and normalize time to 24h
export function parseTime(time: TimeInput): Time {
	// account for null
	time = time || defaultTime

	let hour = 0
	let minute = 0
	let meridiem: null | string = null

	// parse basic numbers from string or object
	if (typeof time === 'string') {
		// if is string
		let match = time.match(TIME_PARSE_MERIDIEM)
		if (match) {
			// 12 hr string
			hour = parseInt(match[1], 10)
			minute = parseInt(match[2], 10)

			meridiem = match[3].toLowerCase()
		} else {
			// 24 hr string
			match = time.match(TIME_PARSE_24)
			if (!match) {
				throw new Error('Could not parse time (string)')
			}
			hour = parseInt(match[1], 10)
			minute = parseInt(match[2], 10)
		}
	} else if (typeof time === 'object') {
		// if is object
		if (!Number.isInteger(time.hour) || !Number.isInteger(time.minute)) {
			throw new Error('Time and minute must both be valid integers')
		}
		hour = time.hour
		minute = time.minute
		if (time.meridiem) {
			meridiem = time.meridiem.toLowerCase()
		}
	}

	if (minute > 60) {
		throw new Error('Minute out of range (> 60)')
	}

	// normalize hours
	if (meridiem != null) {
		if (hour > 12) {
			throw new Error('Hour out of range (> 12)')
		}
		// handling the 12 hr conversion
		if (meridiem === 'pm' && hour !== 12) {
			hour += 12
		} else if (meridiem === 'am' && hour === 12) {
			hour = 0
		}
	} else {
		// handling the 24 hour conversion
		if (hour > 24) {
			throw new Error('Hour out of range (> 24)')
		}
		if (hour === 24) {
			hour = 0
		}
	}

	return {
		hour,
		minute,
	}
}

// formats time output to poss to parent
export function composeTime(hour: number, minute: number): TimeOutput {
	const paddedMinute = ('0' + minute).slice(-2)
	const hour24 = hour === 24 ? 0 : hour

	const meridiem = hour >= 12 ? 'pm' : 'am'
	let hour12 = hour
	if (hour > 12) {
		hour12 = hour - 12
	} else if (hour === 0) {
		hour12 = hour = 12
	}

	return {
		formatted24: `${hour24}:${paddedMinute}`,
		formatted12: `${hour12}:${paddedMinute} ${meridiem}`,
		formattedSimple: `${hour12}:${paddedMinute}`,
		hour: hour24,
		hour12: hour12,
		minute: minute,
		meridiem: meridiem,
	}
}
