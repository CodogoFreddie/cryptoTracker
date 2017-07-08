import React from "react";
import R from "ramda";
import { renderToStaticMarkup, } from "react-dom/server";
import styled, { ServerStyleSheet, } from "styled-components";

import moment from "moment";

const Root = styled.div`font-family: sans-serif;`;

const Title = styled.h1`margin: 0;`;

const shadow = (height, over = 0) => {
	const h = height - over;
	return `
				box-shadow:
					0px ${3 * h}px ${h}px ${-h}px rgba(0, 0, 0, ${h / 10}),
					0px ${h}px ${2 * h}px ${h}px rgba(0, 0, 0, ${h / 20});
				z-index: ${height};
			`;
};

const ExchangesContainer = styled.div`
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
`;

const ExchangeStyled = styled.div`
	background-color: #fff;
	border-radius: 1em;
	margin: 1em;
	padding: 1em;
	${shadow(2)};
`;

const ExchangeHeader = styled.div`
	display: flex;
	justify-content: space-between;
`;

const Table = styled.table`
	font-family: monospace;
	min-width: 15em;
	table-layout: fixed;
`;

const Header = styled.td`text-align: center;`;

const DataCellStyled = styled.td`
	color: ${({ sign, }) => (sign > 0 ? "green" : "red")};
`;

const DataCell = ({ value, }) =>
	<DataCellStyled sign = { Math.sign(value) }>
		{" "}{Math.abs(value)}{" "}
	</DataCellStyled>;

const Exchange = ({ lhs, rhs, max, avg, min, importance, }) =>
	<ExchangeStyled>
		<ExchangeHeader>
			<span>
				{lhs} / {rhs}
			</span>
			<span>
				({importance.toPrecision(2)})
			</span>
		</ExchangeHeader>

		<Table>
			<tbody>
				<tr>
					<td />
					<Header>σ</Header>
					<Header>x</Header>
					<Header>Δ</Header>
				</tr>

				<tr>
					<Header>⎡x⎤</Header>
					<DataCell value = { max.stdDev } />
					<td>
						{" "}{max.value}{" "}
					</td>
					<DataCell value = { max.delta } />
				</tr>

				<tr>
					<Header>x</Header>
					<DataCell value = { avg.stdDev } />
					<td>
						{" "}{avg.value}{" "}
					</td>
					<DataCell value = { avg.delta } />
				</tr>

				<tr>
					<Header>⎣x⎦</Header>
					<DataCell value = { min.stdDev } />
					<td>
						{" "}{min.value}{" "}
					</td>
					<DataCell value = { min.delta } />
				</tr>
			</tbody>
		</Table>
	</ExchangeStyled>;

export default data => {
	const Component = () =>
		<Root>
			<Title>
				Crypto Report ({moment().format("DD-MM-YY")})
			</Title>

			<code>
				Sorry that there's too much data, Next thing on my to do list is
				to sort and order the information
			</code>

			<ExchangesContainer>
				{R.pipe(
					R.sortBy(R.prop("importance")),
					R.reverse,
					R.map(props =>
						<Exchange key = { props.lhs + props.rhs } { ...props } />,
					),
				)(data)}
			</ExchangesContainer>

			<code>Coming soon: + Buy/Sell presure</code>
		</Root>;

	const sheet = new ServerStyleSheet();
	const html = renderToStaticMarkup(sheet.collectStyles(<Component />));
	const css = sheet.getStyleTags();

	return {
		data,
		html: `<html><head>${css}</head><body>${html}</body></html>`,
	};
};
