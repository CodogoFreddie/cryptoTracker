require("source-map-support").install();
require("babel-register")({
	sourceMaps: true,
});

import shitFetch from "node-fetch";
import R from "ramda";
import mysql from "mysql";

import pairs from "./pairs";

const connection = mysql.createConnection({
	host: "localhost",
	user: "freddie",
	password: "",
});

Promise.all(
	pairs.map(([lhs, rhs,]) =>
		shitFetch(`https://api.cryptonator.com/api/ticker/${lhs}-${rhs}`)
			.then(x => x.json())
			.then(({ ticker, timestamp, }) => ({
				timestamp,
				rate: parseFloat(R.prop("price")(ticker), 10),
			}))
			.then(({ timestamp, rate, }) =>
				connection.query(
					{
						sql: "INSERT INTO crypto_tracker.rates  VALUES ( ?, ?, ?, ? );",
						timeout: 40000, // 40s
						values: [timestamp, rate, lhs, rhs,],
					},
					err => (err ? console.error(err) : null),
				),
			),
	),
).then(() =>
	connection.end(function(err) {
		console.log("DONE SQL");
		err && console.error(err);
	}),
);
