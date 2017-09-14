import mysql from "mysql";
import fs from "fs";
import R from "ramda";
import moment from "moment";

const connection = mysql.createConnection({
	host: "localhost",
	user: "freddie",
	password: "",
});

const getData = (lhs, rhs) => {
	const before = moment().unix();
	const after = moment().subtract(3, "months").unix();

	console.log( before, after);

	return new Promise( done => 
		connection.query(
			{
				sql: `
				SELECT timestamp, rate FROM crypto_tracker.rates
						WHERE
							timestamp < ?
						AND
							timestamp > ?
						AND
							lhs = ?
						AND
							rhs = ?
				`,
				timeout: 5000,
				values: [before, after, lhs, rhs,],
			},
			(err, res) => done(res),
		)
	);
};

const generateGraph = (lhs, rhs) => getData(lhs, rhs)
	.then(R.map( ({ timestamp, rate }) => timestamp + " " + rate ))
	.then(R.join("\n"))
	.then( s => fs.writeFile(
		`/tmp/${lhs}-${rhs}.dat`,
		s,
		(err) => {
			if(err) {
				return console.log(err);
			}

			console.log("The file was saved!");
		}
	))
	.then(() =>
		connection.end(function(err) {
			console.log("DONE SQL");
			err && console.error(err);
		}),
	)
	.catch(console.error);

generateGraph("btc", "usd");
