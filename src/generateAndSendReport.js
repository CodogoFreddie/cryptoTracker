import mysql from "mysql";

import getAverage from "./getAverage";
import getStdDev from "./getStdDev";

const connection = mysql.createConnection({
	host: "localhost",
	user: "freddie",
	password: "",
});

getAverage(connection, "btc", "eth", 1, "day").then(console.log);
getStdDev(connection, "btc", "eth", 1, "day").then(console.log);

connection.end(function(err) {
	console.log("DONE SQL");
	err && console.error(err);
});
