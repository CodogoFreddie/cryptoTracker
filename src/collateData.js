import moment from "moment";
import R from "ramda";

import pairs from "./pairs";
import getDerived from "./getDerived";

const importanceOfValue = ({ stdDev, delta, }) => Math.abs(delta * stdDev);

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
						stdDev: (max - longAvg) / stddev,
						value: max,
						delta: (max - prevMax) / max,
					},

					avg: {
						stdDev: (avg - longAvg) / stddev,
						value: avg,
						delta: (avg - prevAvg) / avg,
					},

					min: {
						stdDev: (min - longAvg) / stddev,
						value: min,
						delta: (min - prevMin) / min,
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
