import R from "ramda";

export const currencies = ["gbp", "btc", "eth", "xmr", "doge", "bat", "omg",];

export default R.pipe(
	R.flatten,
	R.filter(Boolean),
	R.map(({ lhs, rhs, }) => [lhs, rhs,]),
)(
	currencies.map((lhs, li) =>
		currencies.map(
			(rhs, ri) =>
				ri !== li
					? {
						lhs,
						rhs,
					}
					: null,
		),
	),
);
