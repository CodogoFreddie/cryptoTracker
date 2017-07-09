require("source-map-support").install();
require("babel-register")({
	sourceMaps: true,
});

import shitFetch from "node-fetch";
import moment from "moment";
import R from "ramda";
import mysql from "mysql";

import { currencies, } from "./pairs";

/*

MariaDB [(none)]> DESCRIBE crypto_tracker.rates;
+-----------+----------------+------+-----+---------+-------+
| Field     | Type           | Null | Key | Default | Extra |
+-----------+----------------+------+-----+---------+-------+
| timestamp | int(32)        | YES  |     | NULL    |       |
| rate      | decimal(32,16) | YES  |     | NULL    |       |
| lhs       | char(16)       | YES  |     | NULL    |       |
| rhs       | char(16)       | YES  |     | NULL    |       |
| buy       | int(32)        | YES  |     | 0       |       |
| sell      | int(32)        | YES  |     | 0       |       |
+-----------+----------------+------+-----+---------+-------+

*/

const connection = mysql.createConnection({
	host: "localhost",
	user: "freddie",
	password: "",
});

Promise.resolve(currencies.map(R.toUpper).join(","))
	.then(
		syms =>
			`https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${syms}&tsyms=${syms}`,
	)
	.then(shitFetch)
	.then(x => x.json())
	.then(R.prop("RAW"))
	.then(R.toPairs)
	.then(
		R.map(([lhs, data,]) =>
			R.pipe(
				R.toPairs,
				R.map(([rhs, { PRICE, VOLUME24HOUR, VOLUME24HOURTO, },]) => ({
					lhs,
					rhs,
					rate: PRICE,
					buy: VOLUME24HOURTO,
					sell: VOLUME24HOUR * PRICE,
					timestamp: moment().unix(),
				})),
				R.map(R.over(R.lensProp("lhs"), R.toLower)),
				R.map(R.over(R.lensProp("rhs"), R.toLower)),
			)(data),
		),
	)
	.then(
		R.pipe(
			R.flatten,
			R.map(({ lhs, rhs, rate, buy, sell, timestamp, }) =>
				connection.query(
					{
						sql:
							"INSERT INTO crypto_tracker.rates  VALUES ( ?, ?, ?, ?, ?, ? );",
						timeout: 60000, // 60s
						values: [timestamp, rate, lhs, rhs, buy, sell,],
					},
					err =>
						err
							? console.error(err)
							: console.log(
								[timestamp, rate, lhs, rhs, buy, sell,].join(
									",\t",
								),
							),
				),
			),
			ps => Promise.all(ps),
		),
	)
	.then(() =>
		connection.end(function(err) {
			console.log("DONE SQL");
			err && console.error(err);
		}),
	);
