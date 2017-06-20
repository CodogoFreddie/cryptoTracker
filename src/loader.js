require("source-map-support").install();
require("babel-register")({
	sourceMaps: true,
});

import shitFetch from "node-fetch";
import moment from "moment";
import R from "ramda";
import mysql from "mysql";

import { currencies, } from "./pairs";

const connection = mysql.createConnection({
	host: "localhost",
	user: "freddie",
	password: "",
});

Promise.resolve(currencies.map(R.toUpper).join(","))
	.then( (syms) => `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${syms}&tsyms=${syms}`)
	.then(shitFetch)
	.then( x => x.json() )
	.then(R.pipe(
		R.toPairs,

		R.map(
			([lhs, rates,]) => R.pipe(
				R.toPairs,
				R.map( ([rhs, rate,]) => ({
					lhs,
					rhs,
					rate,
				}))
			)(rates)

		),

		R.flatten,

		R.filter( ({ lhs, rhs, }) => lhs !== rhs ),

		R.map(
			R.over(
				R.lensProp("lhs"),
				R.toLower,
			)
		),
		
		R.map(
			R.over(
				R.lensProp("rhs"),
				R.toLower,
			)
		),

		R.map(R.assoc("timestamp", moment().unix(), )),

		R.map( ({ lhs, rhs, rate, timestamp, }) => connection.query(
			{
				sql: "INSERT INTO crypto_tracker.rates  VALUES ( ?, ?, ?, ? );",
				timeout: 60000, // 60s
				values: [timestamp, rate, lhs, rhs,],
			},
			err => (err ? console.error(err) : console.log( [timestamp, rate, lhs, rhs,] ) ),
		)),

		ps => Promise.all(ps),
	
	))

.then(() =>
	connection.end(function(err) {
		console.log("DONE SQL");
		err && console.error(err);
	}),
);
