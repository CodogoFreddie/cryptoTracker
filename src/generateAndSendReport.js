import mysql from "mysql";

import report from "./components";
import sendReportAsMail from "./sendReportAsMail";

const connection = mysql.createConnection({
	host: "localhost",
	user: "freddie",
	password: "",
});

report(connection).then(sendReportAsMail);

connection.end(function(err) {
	console.log("DONE SQL");
	err && console.error(err);
});
