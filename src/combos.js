import R from "ramda";

import pairs from "./pairs";
import periods from "./periods";
import deriveds from "./derived";

export default R.flatten(
	pairs.map(([lhs, rhs]) =>
		periods.map(({ n, unit }) =>
			deriveds.map(derived => ({
				lhs,
				rhs,
				n,
				unit,
				derived,
			})),
		),
	),
);
