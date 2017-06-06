import React from "react";
import ReactDOMServer from "react-dom/server";

import calculateDataForArgs from "./calculateDataForArgs";

export const sigFig = n => x => {
	if (typeof x === "number") {
		const exponent = Math.floor(Math.log10(x)) - n;
		const significand = x / Math.pow(10, exponent);

		return ("" + Math.round(significand) * Math.pow(10, exponent)).slice(
			0,
			n + 1,
		);
	} else {
		return x;
	}
};

export default (key, periodPairs) => {
	const data = periodPairs.map(([n, unit,]) =>
		calculateDataForArgs(key, n, unit, true),
	);

	return ReactDOMServer.renderToStaticMarkup(
		<div>
			<h1>{key}</h1>

			<table
				style = { {
					tableLayout: "fixed",
					width: "100%",
				} }
			>
				<tbody>
					<tr>
						<td>Period</td>
						<td>Mean</td>
						<td>Current Value</td>
						<td>Deviation (non-normalised)</td>
						<td>Data Points</td>
					</tr>
					{data.map(
						({
							period,
							mean,
							currentValue,
							currentDeviationRelative,
							currentDeviation,
							data,
						}) => (
							<tr key = { period }>
								<td>{period}</td>
								<td>{sigFig(4)(mean)}</td>
								<td>{sigFig(4)(currentValue)}</td>
								<td>
									{sigFig(4)(currentDeviationRelative)}
									{" "}
									(
									{sigFig(4)(currentDeviation)}
									)
								</td>
								<td>{sigFig(4)(data)}</td>
							</tr>
						),
					)}
				</tbody>
			</table>
		</div>,
	);
};
