require('source-map-support').install();
require('babel-register')({
	sourceMaps: true
});

import { AsyncNodeStorage } from 'redux-persist-node-storage';
import { persistStore, autoRehydrate, } from "redux-persist";
import getRate from "./getRate";
import moment from "moment";
import R from "ramda";

import store from "./redux";

const getAndStoreRate = (a, b) => getRate(a, b).then( ({ key, ...entry, }) => store.dispatch({
	type: "ADD_ENTRY",
	key,
	entry,
}));

const createSubscription = (a, b) => setInterval(
	() => getAndStoreRate(a, b),
	60 * 1000
);

const getStd = mean => R.pipe(
	R.reduce(
		(sum, datum) => ( sum + ( ( mean - datum ) * ( mean - datum ) ) ),
		0,
	),
	Math.sqrt,
);

const getReport = (key, n, unit) => R.pipe(
	R.prop(key),
	R.toPairs,
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

	R.dissoc("data"),

	R.assoc("key", key),
	R.assoc("period", `${n} ${unit}`),

	console.log,
)(store.getState());

persistStore(
	store,
	{
		storage: new AsyncNodeStorage( "./storage" ),
		debounce: 1000,
	},
	() => getReport("btc_eth", 1, "day"),
);

createSubscription("btc", "eth");
createSubscription("btc", "gbp");
createSubscription("eth", "gbp");
