import R from "ramda";

import periods from "./periods";
import pairs from "./pairs";
import getDerived from "./getDerived";
import derived from "./derived";

import comboToKey from "./comboToKey";

const allCombos = R.flatten(
	pairs.map(([lhs, rhs,]) =>
		periods.map(({ n, unit, }) =>
			derived.map(derived => ({
				lhs,
				rhs,
				n,
				unit,
				derived,
			})),
		),
	),
);

export default connection =>
	Promise.all(
		allCombos.map(({ lhs, rhs, n, unit, derived, }) =>
			getDerived(connection, lhs, rhs, n, unit, derived),
		),
	)
		.then(R.fromPairs)
		.then(data =>
			R.reduce(
				(data, combo) => ({
					...data,
					[comboToKey(combo)]: data[comboToKey(combo)] /
						data[
							comboToKey({
								...combo,
								n: 3,
								unit: "months",
							})
						],
				}),
				data,
				allCombos,
			),
		);
