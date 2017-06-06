import mysql from "mysql";

import getDerived from "./getDerived";

const connection = mysql.createConnection({
	host: "localhost",
	user: "freddie",
	password: "",
});

getDerived(connection, "btc", "eth", 1, "day", "stddev").then(console.log);
getDerived(connection, "btc", "eth", 1, "day", "avg").then(console.log);
getDerived(connection, "btc", "eth", 1, "day", "min").then(console.log);
getDerived(connection, "btc", "eth", 1, "day", "max").then(console.log);

connection.end(function(err) {
	console.log("DONE SQL");
	err && console.error(err);
});
