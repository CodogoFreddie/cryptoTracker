require("dotenv").config();

import mysql from "mysql";

import collateData from "./collateData";
import report from "./components";
import sendReportAsMail from "./sendReportAsMail";

const connection = mysql.createConnection({
	host: "localhost",
	user: "freddie",
	password: "",
});

collateData(connection).then(report).then(sendReportAsMail);

connection.end(function(err) {
	console.log("DONE SQL");
	err && console.error(err);
});
