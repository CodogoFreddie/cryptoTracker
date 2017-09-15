export default (connection, lhs, rhs, before, after, derived) =>
	new Promise(done =>
		connection.query(
			{
				sql: `
				SELECT ${derived.toUpperCase()}(rate)
					FROM crypto_tracker.rates
						WHERE
							timestamp < ?
						AND
							timestamp > ?
						AND
							lhs = ?
						AND
							rhs = ?
				`,
				timeout: 40000,
				values: [before, after, lhs, rhs,],
			},
			(err, res) => done(res[0][`${derived.toUpperCase()}(rate)`]),
		),
	);
