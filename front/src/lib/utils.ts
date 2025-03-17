export function toHumanDate(date?: Date, exact: boolean = false) {
	if (!date || isNaN(date.getTime())) {
		return '';
	}
	const delta = Date.now() - date.getTime();
	const absDelta = Math.abs(delta);

	if (absDelta > 1000 * 60 * 60 * 24) {
		return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
	}

	if (absDelta < 1000) {
		return 'just now';
	}

	const hours = Math.floor(absDelta / (1000 * 60 * 60));
	const minutes = Math.floor((absDelta % (1000 * 60 * 60)) / (1000 * 60));
	const seconds = Math.floor((absDelta % (1000 * 60)) / 1000);
	let result = '';
	if (delta < 0) {
		result += 'in ';
	}
	if (hours > 0) {
		result += hours + 'h ';
	}
	if (minutes > 0) {
		result += minutes + 'm ';
	}
	if ((seconds > 0 && hours === 0 && minutes < 10) || exact) {
		result += seconds + 's ';
	}

	if (delta > 0) {
		result += 'ago';
	}
	return result;
}

export function toHumanTime(milliseconds?: number) {
	if (!milliseconds) {
		return '';
	}

	const hours = Math.floor(milliseconds / (1000 * 60 * 60));
	const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
	const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
	let result = '';
	if (hours > 0) {
		result += hours + 'h ';
	}
	if (minutes > 0) {
		result += minutes + 'm ';
	}
	if (seconds > 0 && hours === 0 && minutes < 10) {
		result += seconds + 's ';
	}
	return result;
}
