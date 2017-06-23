import React from "react";
import { renderToStaticMarkup, } from "react-dom/server";
import styled, { ServerStyleSheet, } from "styled-components";

import moment from "moment";

import { currencies, } from "../pairs";
import comboToKey from "../comboToKey";

import Currency from "./currency";

const Title = styled.h1`
	margin: 0;
`;

export default dataTable => {
	const getValues = (lhs, rhs, n, unit) =>
		dataTable[comboToKey({ lhs, rhs, n, unit, })];

	const Component = () => (
		<div>
			<Title>Crypto Report ({moment().format("DD-MM-YY")})</Title>

			<code>How to read:</code>

			<table>
				<tbody>
					<tr>
						<td>value</td>
						<td>(change in value)</td>
						<td>[deviation in value]</td>
					</tr>
					<tr>
						<td>std deviation</td>
						<td>(change in std deviation)</td>
						<td>[stability]</td>
					</tr>
				</tbody>
			</table>

			{currencies.map(currency => (
				<Currency
					key = { currency }
					currency = { currency }
					getValues = { getValues }
				/>
			))}

		</div>
	);

	const sheet = new ServerStyleSheet();
	const html = renderToStaticMarkup(sheet.collectStyles(<Component />));
	const css = sheet.getStyleTags();

	return `<html><head>${css}</head><body>${html}</body></html>`;
};
