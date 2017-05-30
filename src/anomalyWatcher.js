import R from "ramda";
import mailgun from "mailgun-js";

import calculateDataForArgs from "./calculateDataForArgs";
import generateReport, { sigFig, } from "./generateReport";

import { apiKey, domain, } from "./secrets";

const mailgunClient = mailgun({
	apiKey,
	domain,
});

const unitKeyPairs = [
	[1, "day",],
	[3, "days",],
	[1, "week",],
	[2, "weeks",],
	[1, "month",],
	[3, "months",],
];

export const sendReportToMe = key => {
	const variances = unitKeyPairs.map(([n, unit,]) =>
		R.pipe(R.prop("currentDeviationRelative"), sigFig(3))(
			calculateDataForArgs(key, n, unit),
		),
	);

	var data = {
		from: "Freddie Ridell <freddie.ridell@gmail.com>",
		to: "freddie.ridell@gmail.com",
		subject: `update: ${key} (${variances.join("\t")})`,
		html: generateReport(key, unitKeyPairs),
	};

	console.log("sending mail");
	mailgunClient.messages().send(data, () => console.log("mail sent"));
};

export default key => {
	unitKeyPairs.forEach(([n, unit,]) => {
		const { currentDeviationRelative, } = calculateDataForArgs(key, n, unit);

		if (Math.abs(currentDeviationRelative) > 1) {
			console.log(
				`outside of bounds for ${key} over a period of ${n} ${unit}, sending report`,
			);
			sendReportToMe(key);
		}

		return;
	});
	console.log(`within bounds for ${key}, doing nothing`);
};
