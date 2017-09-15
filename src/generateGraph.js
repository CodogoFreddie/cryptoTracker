import mysql from "mysql";
import fs from "fs";
import R from "ramda";
import moment from "moment";
import {spawn, } from "child_process";

import getDerived from "./getDerived";

const connection = mysql.createConnection({
	host: "localhost",
	user: "freddie",
	password: "",
});

const getData = (lhs, rhs) => {
	const before = moment().unix();
	const after = moment().subtract(3, "months").unix();

	return new Promise( (done, fail)  => 
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
			(err, res) => err ? fail(err) : done(res),
		)
	);
};

const generateGraph = (lhs, rhs) => getData(lhs, rhs)
.then(R.tap(console.log))
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
	.then( () => `
		set terminal png size 400,200 enhanced font "Helvetica,10"
		set output '/tmp/${lhs}-${rhs}.png'

		set xdata time
		set timefmt "%s"
		set format x "%d/%m"
		set xtics 1000000
		set autoscale xfix

		a(x) = 2000
		b(x) = 3000
		c(x) = 4000

		plot \
			a(x) notitle linewidth 2, \
			b(x) notitle linewidth 2, \
			c(x) notitle linewidth 2, \
			'/tmp/${lhs}-${rhs}.dat' u 1:2 smooth sbezier notitle linewidth 2
		`
	)
	.then(R.tap(console.log))
	.then( program => {
		const child = spawn('gnuplot');

		child.stdin.setEncoding('utf-8');
		child.stdout.pipe(process.stdout);

		child.stdin.write(program);

		child.stdin.end();
	})
	.then(R.tap(console.log))
	.then(() =>
		connection.end(function(err) {
			console.log("DONE SQL");
			err && console.error(err);
		}),
	)
	.catch(console.error);

generateGraph("btc", "gbp");
