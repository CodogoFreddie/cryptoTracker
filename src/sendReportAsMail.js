import mailgun from "mailgun-js";
import moment from "moment";

import { apiKey, domain, } from "./secrets";

const mailgunClient = mailgun({
	apiKey,
	domain,
});

export default html => {
	var data = {
		from: "Freddie Ridell <freddie.ridell@gmail.com>",
		to: "freddie.ridell@gmail.com, ",
		subject: `Daily Crypto Report (${moment().format("DD-MM-YY")})`,
		html,
	};

	console.log("sending mail");

	mailgunClient.messages().send(data, (err, data) => {
		if (err) {
			console.error(err);
		}
		console.log("mail sent", data);
	});
};
