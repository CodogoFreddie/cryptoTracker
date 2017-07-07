import R from "ramda";

export const currencies = [
	"btc",
	"eth",
	"xmr",
	"zec",
	"xvg",
	"etc",
	"gbp",
	"usd",
];

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
