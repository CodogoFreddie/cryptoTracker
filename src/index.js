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

const createGetSubscription = (a, b) => setInterval(
	() => getAndStoreRate(a, b),
	1 * 60 * 1000
);

const createCalcSubscription = ( key, n, unit) => setInterval(
	() => calculateDataForArgs( key, n, unit ),
	10 * 60 * 1000
);

const createReportSubscription = ( key, ) => setInterval(
	() => getReport( key),
	10 * 60 * 1000
);

const getJustInDate = (n, unit) => R.pipe(
	(data) => {
		console.log(n, unit, moment());
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

const calculateDataForArgs = (key, n, unit, isForReport = false) => R.pipe(
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

	R.tap(
		({ currentDeviationRelative, }) => (
			currentDeviationRelative > 0.5 && !isForReport
			? getReport(key)
			: null
		)
	),

)(store.getState());

const sigFig = (n) => (x) => {
	if(typeof x === "number"){
		const exponent = Math.floor(Math.log10(x)) - n;
		const significand = ( x ) / Math.pow(10, exponent);

		return ( "" + ( Math.round(significand) * Math.pow(10, exponent) ) ).slice(0, n + 1);
	}
	else{
		return x;
	}
};

const sigFigs = (n) => (strings, ...values) => R.pipe(
	R.reduce(
		(acc, value) => ({
			strings: R.tail(acc.strings),
			string: acc.string + sigFig(4)(value) + R.head(acc.strings),
		}),
		{
			strings: strings.slice(1, Infinity),
			string: strings[0],
		},
	),
	R.prop("string"),
)(values)

const getReport = (key) => {

	console.log("get report");

	const data = [
		calculateDataForArgs(key, 3, "months", true),
		calculateDataForArgs(key, 1, "month", true),
		calculateDataForArgs(key, 2, "weeks", true),
		calculateDataForArgs(key, 1, "week", true),
		calculateDataForArgs(key, 3, "days", true),
		calculateDataForArgs(key, 1, "day", true),
	];


	return `
		<div>
			<h1>${key}<h1/>

			<table>
				<tr>
					<td>Period</td> <td>Mean</td> <td>Current Value</td> <td>Deviation (non-normalised)</td> <td>Data Points</td>
				</tr>
				${
					data.map( ({
						period,
						mean,
						currentValue,
						currentDeviationRelative,
						currentDeviation,
						data,
					}) => (
						sigFigs(4)`
							<tr>
								<td>${period}</td>
								<td>${mean}</td>
								<td>${currentValue}</td>
								<td>${currentDeviationRelative} (${currentDeviation})</td>
								<td>${data}</td>
							</tr>
						`
					)).join("\n")
				}
			</table>
		</div>
	`;
};

persistStore(
	store,
	{
		storage: new AsyncNodeStorage( "./storage" ),
		debounce: 1000,
	},
	() => console.log(getReport("btc_eth")),
);

createGetSubscription("btc", "eth");
createGetSubscription("btc", "gbp");
createGetSubscription("eth", "gbp");

//createCalcSubscription("btc_eth", 3, "months");
//createCalcSubscription("btc_eth", 1, "month");
//createCalcSubscription("btc_eth", 2, "weeks");
//createCalcSubscription("btc_eth", 1, "week");
//createCalcSubscription("btc_eth", 3, "days");
//createCalcSubscription("btc_eth", 1, "day");

//createCalcSubscription("btc_gbp", 3, "months");
//createCalcSubscription("btc_gbp", 1, "month");
//createCalcSubscription("btc_gbp", 2, "weeks");
//createCalcSubscription("btc_gbp", 1, "week");
//createCalcSubscription("btc_gbp", 3, "days");
//createCalcSubscription("btc_gbp", 1, "day");

//createCalcSubscription("eth_gbp", 3, "months");
//createCalcSubscription("eth_gbp", 1, "month");
//createCalcSubscription("eth_gbp", 2, "weeks");
//createCalcSubscription("eth_gbp", 1, "week");
//createCalcSubscription("eth_gbp", 3, "days");
//createCalcSubscription("eth_gbp", 1, "day");

createReportSubscription("btc_gbp");
createReportSubscription("btc_eth");
createReportSubscription("eth_gbp");
