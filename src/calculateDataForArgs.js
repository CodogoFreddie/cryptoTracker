import moment from "moment";
import R from "ramda";
import store from "./redux";

import generateReport from "./generateReport"

const getJustInDate = (n, unit) => R.pipe(
	(data) => {
		const cutoff = moment().subtract(n, unit).unix();
		return R.filter(
			([timestamp, ]) => (
				timestamp > cutoff
			),
			data
		);
	},
	R.pluck(1),
);

const getStd = mean => R.pipe(
	R.reduce(
		(sum, datum) => (
			sum + ( ( mean - datum ) * ( mean - datum ) )
		),
		0,
	),
	Math.sqrt,
);

export default (key, n, unit ) => R.pipe(
	R.prop(key),
	R.toPairs,

	getJustInDate(n, unit),

	(data) => ({
		data,
		mean: R.mean(data),
	}),

	({ data, mean, }) => ({
		data,
		mean,
		std: getStd(mean)(data),
	}),

	({ data, std, mean, }) => ({
		data,
		std,
		mean,
		currentValue: R.last(data),
	}),

	({ data, std, currentValue, mean, }) => ({
		data,
		std,
		currentValue,
		mean,
		currentDeviation: Math.abs( mean - currentValue ),
		currentDeviationRelative: Math.abs( mean - currentValue ) / std,
	}),

	R.over(
		R.lensProp("data"),
		R.length,
	),

	R.assoc("key", key),
	R.assoc("period", `${n} ${unit}`),

)(store.getState());

