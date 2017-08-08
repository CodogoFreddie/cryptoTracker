require("dotenv").config();

import mailgun from "mailgun-js";
import moment from "moment";

const mailgunClient = mailgun({
	apiKey: process.env.API_KEY,
	domain: process.env.DOMAIN,
});

export default ({ html, data }) => {
	const importantStuff = data
		.filter(
			({ max, avg, min }) =>
				Math.abs(max.stdDev) > 2 ||
				Math.abs(avg.stdDev) > 2 ||
				Math.abs(min.stdDev) > 2,
		)
		.sort(
			(x, y) =>
				x.max.stdDev > y.max.stdDev
					? 1
					: -1 + x.avg.stdDev > y.avg.stdDev
						? 1
						: -1 + x.min.stdDev > y.min.stdDev ? 1 : -1,
		)
		.reverse()
		.map(({ lhs, rhs }) => `${lhs}/${rhs}`)
		.join(" ");

	var emailParams = {
		from: process.env.FROM_EMAIL,
		to: process.env.TO_EMAILS,
		subject: `Daily Crypto Report ${importantStuff} (${moment().format(
			"DD-MM-YY A",
		)})`,
		html,
	};

	mailgunClient.messages().send(emailParams, (err, resp) => {
		if (err) {
			console.error(err);
		}
		console.log("mail sent", resp);
	});
};
