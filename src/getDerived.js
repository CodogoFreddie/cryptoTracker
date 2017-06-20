import moment from "moment";

import comboToKey from "./comboToKey";

export default (connection, lhs, rhs, n, unit, derived) =>
	new Promise(done =>
		connection.query(
			{
				sql: `SELECT ${derived.toUpperCase()}(rate) FROM crypto_tracker.rates WHERE timestamp > ? AND lhs = ? AND rhs = ?`,
				timeout: 40000,
				values: [moment().subtract(n, unit).unix(), lhs, rhs,],
			},
			(err, res) =>
				done([
					comboToKey({ lhs, rhs, n, unit, derived, }),
					res[0][`${derived.toUpperCase()}(rate)`],
				]),
		),
	);
