import R from "ramda";

//const oldPairs = [
//["btc", "gbp",],
//["eth", "gbp",],

//["btc", "eth",],
//["eth", "etc",],

//["btc", "etc",],
//["btc", "xmr",],
//["eth", "xmr",],
//];

export const currencies = ["btc", "eth", "xmr", "etc", "gbp", "usd",];

const newPairs = R.pipe(
	R.flatten,
	R.filter(Boolean),
	R.map(({ lhs, rhs, }) => [lhs, rhs,]),
)(
	currencies.map((lhs, li) =>
		currencies.map(
			(rhs, ri) =>
				ri > li
					? {
						lhs,
						rhs,
					}
					: null,
		),
	),
);

export default newPairs;
