require("dotenv").config();

import mailgun from "mailgun-js";
import moment from "moment";

const mailgunClient = mailgun({
	apiKey: process.env.API_KEY,
	domain: process.env.DOMAIN,
});

export default ({ html, }) => {
	var emailParams = {
		from: process.env.FROM_EMAIL,
		to: process.env.TO_EMAILS,
		subject: `Daily Crypto Report (${moment().format("DD-MM-YY A")})`,
		html,
	};

	console.log("sending mail");

	mailgunClient.messages().send(emailParams, (err, resp) => {
		if (err) {
			console.error(err);
		}
		console.log("mail sent", resp);
	});
};
