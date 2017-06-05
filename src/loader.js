import shitFetch from "node-fetch";
import R from "ramda";
import mysql from "mysql";

import pairs from "./pairs";

const connection = mysql.createConnection({
	host: "localhost",
	user: "freddie",
	password: "",
});

pairs.forEach(([lhs, rhs,]) =>
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
				err => (err ? console.err(err) : null),
			),
		),
);

connection.end(function(err) {
	console.log("DONE SQL");
	err && console.error(err);
});
