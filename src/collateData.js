import R from "ramda";

import periods from "./periods";
import pairs from "./pairs";
import getDerived from "./getDerived";
import derived from "./derived";

import comboToKey from "./comboToKey";

const threeMonths = { n: 3, unit: "months", };

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
			pairs.map(([lhs, rhs,]) =>
				periods.map(({ n, unit, }) => ({
					lhs,
					rhs,
					n,
					unit,

					avg: data[
						comboToKey({ lhs, rhs, n, unit, derived: "avg", })
					],
					avgDelta: data[
						comboToKey({ lhs, rhs, n, unit, derived: "avg", })
					] -
						data[
							comboToKey({
								lhs,
								rhs,
								n,
								unit,
								derived: "avg",
								...threeMonths,
							})
						],
					avgDeviations: (data[
						comboToKey({ lhs, rhs, n, unit, derived: "avg", })
					] -
						data[
							comboToKey({
								lhs,
								rhs,
								n,
								unit,
								derived: "avg",
								...threeMonths,
							})
						]) /
						data[
							comboToKey({
								lhs,
								rhs,
								n,
								unit,
								derived: "stddev",
								...threeMonths,
							})
						],

					stddev: data[
						comboToKey({ lhs, rhs, n, unit, derived: "stddev", })
					],

					stddevDelta: data[
						comboToKey({ lhs, rhs, n, unit, derived: "stddev", })
					] -
						data[
							comboToKey({
								lhs,
								rhs,
								n,
								unit,
								derived: "stddev",
								...threeMonths,
							})
						],

					stability: data[
						comboToKey({ lhs, rhs, n, unit, derived: "avg", })
					] /
						data[
							comboToKey({ lhs, rhs, n, unit, derived: "stddev", })
						],
				})),
			),
		)
		.then(R.flatten)
		.then(
			R.map(({ lhs, rhs, n, unit, ...rest }) => [
				comboToKey({ lhs, rhs, n, unit, }),
				rest,
			]),
		)
		.then(R.fromPairs);
//.then(data =>
//);
