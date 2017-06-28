import moment from "moment";
import R from "ramda";

import pairs from "./pairs";
import getDerived from "./getDerived";

export default connection => {
	const now = moment().unix();
	const twelveHoursAgo = moment().subtract(12, "hours").unix();
	const oneDayAgo = moment().subtract(1, "day").unix();
	const threeMonthsAgo = moment().subtract(3, "months").unix();

	return Promise.all(
		pairs.map(([lhs, rhs,]) =>
			Promise.all([
				Promise.resolve(lhs),
				Promise.resolve(rhs),

				getDerived(connection, lhs, rhs, now, twelveHoursAgo, "min"),
				getDerived(connection, lhs, rhs, now, twelveHoursAgo, "avg"),
				getDerived(connection, lhs, rhs, now, twelveHoursAgo, "max"),

				getDerived(
					connection,
					lhs,
					rhs,
					twelveHoursAgo,
					oneDayAgo,
					"min",
				),
				getDerived(
					connection,
					lhs,
					rhs,
					twelveHoursAgo,
					oneDayAgo,
					"avg",
				),
				getDerived(
					connection,
					lhs,
					rhs,
					twelveHoursAgo,
					oneDayAgo,
					"max",
				),

				getDerived(connection, lhs, rhs, now, threeMonthsAgo, "min"),
				getDerived(connection, lhs, rhs, now, threeMonthsAgo, "avg"),
				getDerived(connection, lhs, rhs, now, threeMonthsAgo, "stddev"),
				getDerived(connection, lhs, rhs, now, threeMonthsAgo, "min"),
			]),
		),
	).then(
		R.map(
			(
				[
					lhs,
					rhs,

					min,
					avg,
					max,

					prevMin,
					prevAvg,
					prevMax,

					longMin,
					longAvg,
					stddev,
					longMax,
				],
			) => ({
				lhs,
				rhs,

				max: {
					stdDev: ((max - longAvg) / stddev).toPrecision(2),
					value: max.toPrecision(4),
					delta: (max - prevMax).toPrecision(2),
				},

				avg: {
					stdDev: ((avg - longAvg) / stddev).toPrecision(2),
					value: avg.toPrecision(4),
					delta: (avg - prevAvg).toPrecision(2),
				},

				min: {
					stdDev: ((min - longAvg) / stddev).toPrecision(2),
					value: min.toPrecision(4),
					delta: (min - prevMin).toPrecision(2),
				},
			}),
		),
	);
};
