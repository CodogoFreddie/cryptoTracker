import R from "ramda";

import periods from "./periods"

import pairs from "./pairs";

import getDerived from "./getDerived";

const allCombos = R.flatten(
	pairs.map( ([lhs, rhs,]) => (
		periods.map( ({ n, unit, }) => (
			["avg", "stddev", "min", "max", "count",].map( (derived) => ({
				lhs,
				rhs,
				n,
				unit,
				derived,
			}))
		))
	))
);
export default (connection) => Promise.all(
	allCombos.map( ({ lhs, rhs, n, unit, derived, }) => getDerived( connection, lhs, rhs, n, unit, derived, )),
).then( R.fromPairs )
