import R from "ramda";

export default [
	["btc", "gbp",],
	["eth", "gbp",],

	["btc", "eth",],
	["eth", "etc",],

	["btc", "etc",],
	["btc", "xmr",],
	["eth", "xmr",],
];

const currencies = ["btc", "eth", "xmr", "etc", "gbp",];

console.log(
	R.flatten(
		currencies.map((lhs, i) =>
			currencies.slice(i + 1, Infinity).map(rhs => ({
				lhs,
				rhs,
			})),
		),
	),
);
