import React from "react";
import { renderToStaticMarkup, } from "react-dom/server";
import styled, { ServerStyleSheet, } from "styled-components";

import moment from "moment";

import pairs, { currencies, } from "../pairs";
import comboToKey from "../comboToKey";
import sigFig from "../sigFig";

import Exchange from "./exchange";
import Currency from "./currency";

const Title = styled.h1`
	margin: 0;
`;

export default dataTable => {
	const getDerived = (lhs, rhs, n, unit, derived) =>
		sigFig(5)(dataTable[comboToKey({ lhs, rhs, n, unit, derived, })]);

	const Component = () => (
		<div>
			<Title>Crypto Report ({moment().format("DD-MM-YY")})</Title>

			{currencies.map(currency => (
				<Currency
					key = { currency }
					currency = { currency }
					getDerived = { getDerived }
				/>
			))}

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
};
