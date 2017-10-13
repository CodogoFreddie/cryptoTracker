import fs from "fs";
import moment from "moment";
import R from "ramda";
import { spawn, } from "child_process";

const standardDeviation = values => {
	var avg = R.mean(values);

	var squareDiffs = values.map(value => {
		var diff = value - avg;
		var sqrDiff = diff * diff;
		return sqrDiff;
	});

	var avgSquareDiff = R.mean(squareDiffs);

	var stdDev = Math.sqrt(avgSquareDiff);
	return stdDev;
};

const getData = (connection, lhs, rhs) => {
	const before = moment().unix();
	const after = moment().subtract(3, "months").unix();

	return new Promise((done, fail) =>
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
			(err, res) => (err ? fail(err) : done(res)),
		),
	);
};

const generateGraph = connection => (lhs, rhs) =>
	getData(connection, lhs, rhs)
		.then(
			values =>
				new Promise((good, fail) =>
					R.pipe(
						R.map(({ timestamp, rate, }) => timestamp + " " + rate),
						R.join("\n"),
						s =>
							fs.writeFile(`/tmp/${lhs}-${rhs}.dat`, s, err => {
								if (err) {
									return fail(err);
								}
								const numbers = R.pluck("rate", values);

								good({
									stdDev: standardDeviation(numbers),
									mean: R.mean(numbers),
								});
							}),
					)(values),
				),
		)
		.then(
			({ stdDev, mean, }) => `
		set terminal png size 400,200 enhanced font "Helvetica,10"
		set output '/tmp/${lhs}-${rhs}-${moment().format("DD-MM-YY-A")}.png'

		set xdata time
		set timefmt "%s"
		set format x "%d/%m"
		set xtics 1000000
		set autoscale xfix

		a(x) = ${mean - 2 * stdDev}
		b(x) = ${mean}
		c(x) = ${mean + 2 * stdDev}

		plot \
			a(x) notitle linewidth 2, \
			b(x) notitle linewidth 2, \
			c(x) notitle linewidth 2, \
			'/tmp/${lhs}-${rhs}.dat' u 1:2 smooth sbezier notitle linewidth 2
		`,
		)
		.then(program => {
			const child = spawn("gnuplot");

			child.stdin.setEncoding("utf-8");
			child.stdout.pipe(process.stdout);

			child.stdin.write(program);

			child.stdin.end();
		})
		.then(() => `/tmp/${lhs}-${rhs}-${moment().format("DD-MM-YY-A")}.png`)
		.then(filename => {
			spawn("aws", [
				"s3",
				"mv",
				filename,
				"s3://freddie-ridell-crypto-tracker-graphs",
			]);
		});

export default generateGraph;
