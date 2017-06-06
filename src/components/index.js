import React from "react";
import R from "ramda";
import { renderToStaticMarkup, } from "react-dom/server";
import styled, { ServerStyleSheet, } from "styled-components";

import moment from "moment";

import pairs from "../pairs";
import periods from "../periods";
import getDerived from "../getDerived";

import Exchange from "./exchange";

const Title = styled.h1`
	margin: 0;
`;

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

export default connection => {
	const configurations = R.flatten(
		pairs.map(([lhs, rhs,]) =>
			periods.map(({ n, unit, }) =>
				["min", "max", "avg", "stddev", "count",].map(derived => ({
					lhs,
					rhs,
					n,
					unit,
					derived,
				})),
			),
		),
	);

	const dataCache = {};

	const start = moment();
	return Promise.all(
		configurations.map(({ lhs, rhs, n, unit, derived, }) =>
			getDerived(connection, lhs, rhs, n, unit, derived).then(result => {
				dataCache[lhs + rhs + n + unit + derived] = result;
			}),
		),
	).then(() => {
		const end = moment();
		const diff = start.diff(end);

		const duration = moment.duration(diff);

		const getDerived = (lhs, rhs, n, unit, derived) =>
			sigFig(5)(dataCache[lhs + rhs + n + unit + derived]);

		const Component = props => (
			<div>
				<Title>Crypto Report </Title>

				<code>calculated in {duration.humanize()}</code>

				{pairs.map(([lhs, rhs,]) => (
					<Exchange
						key = { lhs + rhs }
						getDerived = { getDerived }
						lhs = { lhs }
						rhs = { rhs }
					/>
				))}
			</div>
		);

		const sheet = new ServerStyleSheet();
		const html = renderToStaticMarkup(sheet.collectStyles(<Component />));
		const css = sheet.getStyleTags();

		return `<html><head>${css}</head><body>${html}</body></html>`;
	});
};
