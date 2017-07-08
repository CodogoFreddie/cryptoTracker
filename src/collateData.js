import moment from "moment";
import R from "ramda";

import pairs from "./pairs";
import getDerived from "./getDerived";

const importanceOfValue = ({ stdDev, value, delta, }) =>
	Math.abs(delta * stdDev / value);

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

				getDerived(connection, lhs, rhs, now, threeMonthsAgo, "avg"),
				getDerived(connection, lhs, rhs, now, threeMonthsAgo, "stddev"),
			]),
		),
	)
		.then(R.filter(([_, __, ___, avg,]) => avg > 1))
		.then(
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

						longAvg,
						stddev,
					],
				) => ({
					lhs,
					rhs,

					max: {
						stdDev: ((max - longAvg) / stddev).toFixed(2),
						value: max.toPrecision(4),
						delta: (max - prevMax).toFixed(2),
					},

					avg: {
						stdDev: ((avg - longAvg) / stddev).toFixed(2),
						value: avg.toPrecision(4),
						delta: (avg - prevAvg).toFixed(2),
					},

					min: {
						stdDev: ((min - longAvg) / stddev).toFixed(2),
						value: min.toPrecision(4),
						delta: (min - prevMin).toFixed(2),
					},
				}),
			),
		)
		.then(
			R.map(({ max, avg, min, ...rest }) => ({
				...rest,
				max,
				avg,
				min,

				importance:
					importanceOfValue(min) +
					importanceOfValue(avg) +
					importanceOfValue(max),
			})),
		);
};
