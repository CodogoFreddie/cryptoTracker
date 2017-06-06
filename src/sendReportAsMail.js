import mailgun from "mailgun-js";

import { apiKey, domain, } from "./secrets";

const mailgunClient = mailgun({
	apiKey,
	domain,
});

export default html => {
	var data = {
		from: "Freddie Ridell <freddie.ridell@gmail.com>",
		to: "freddie.ridell@gmail.com, ",
		subject: "Daily Crypto Report",
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
