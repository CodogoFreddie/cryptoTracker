export default n => _x => {
	let sign = _x < 0 ? -1 : 1;
	const x = _x * sign;

	if (typeof x === "number") {
		const exponent = Math.floor(Math.log10(x)) - n;
		const significand = x / Math.pow(10, exponent);

		return (
			sign *
			("" + Math.round(significand) * Math.pow(10, exponent)).slice(
				0,
				n + 1,
			)
		);
	} else {
		return x;
	}
};
