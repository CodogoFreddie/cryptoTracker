export default n => x => {
	if (typeof x === "number") {
		const exponent = Math.floor(Math.log10(x)) - n;
		const significand = x / Math.pow(10, exponent);

		return ("" + Math.round(significand) * Math.pow(10, exponent)).slice(
			0,
			n + 1,
		);
	} else {
		return x;
	}
};
