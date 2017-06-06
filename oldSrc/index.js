require("source-map-support").install();
require("babel-register")({
	sourceMaps: true,
});

import { AsyncNodeStorage, } from "redux-persist-node-storage";
import { persistStore, } from "redux-persist";
import getRate from "./getRate";
import moment from "moment";

import store from "./redux";

import anomalyWatcher, { sendReportToMe, } from "./anomalyWatcher";

const getAndStoreRate = (a, b) =>
	getRate(a, b).then(({ key, ...entry }) =>
		store.dispatch({
			type: "ADD_ENTRY",
			key,
			entry,
		}),
	);

const createGetSubscription = (a, b) =>
	setInterval(() => getAndStoreRate(a, b), 1 * 60 * 1000);

const createAnomalyWatcherSubscription = key =>
	setInterval(() => anomalyWatcher(key), 15 * 60 * 1000);

const makeMorningReport = key => {
	sendReportToMe(key);

	const timeout = moment()
		.add(1, "day")
		.startOf("day")
		.add(9, "hours")
		.diff(moment(), "miliseconds");

	console.log(`reporting on ${key} in ${timeout}ms`);

	setTimeout(() => makeMorningReport(key), timeout);
};

persistStore(
	store,
	{
		storage: new AsyncNodeStorage("./storage"),
		debounce: 1000,
	},
	() =>
		[
			"btc_gbp",
			"eth_gbp",
			"etc_gbp",
			"xmr_gbp",

			"btc_eth",
			"etc_eth",
			"xmr_eth",

			"etc_btc",
			"xmr_btc",
		].forEach(key => {
			createAnomalyWatcherSubscription(key);
			makeMorningReport(key);
			createGetSubscription(key.split("_")[0], key.split("_")[1]);
		}),
);
