import React from "react";
import R from "ramda";
import { renderToStaticMarkup } from "react-dom/server";
import styled, { css, ServerStyleSheet } from "styled-components";

import moment from "moment";

import { currencies } from "../pairs";

const Root = styled.div`font-family: sans-serif;`;

const Title = styled.h1`margin: 0;`;

const shadow = (height, over = 0) => {
	const h = height - over;
	return css`
		box-shadow:
			0px ${3 * h}px ${h}px ${-h}px rgba(0, 0, 0, ${h / 10}),
			0px ${h}px ${2 * h}px ${h}px rgba(0, 0, 0, ${h / 20});
		z-index: ${height};
	`;
};

const ExchangesContainer = styled.div`
	display: flex;
	flex-direction: row;
	overflow-x: scroll;
`;

const ExchangeStyled = styled.div`
	background-color: #fff;
	border-radius: 1em;
	margin: 1em;
	padding: 1em;
	${shadow(1)};
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
	color: ${({ sign }) => (sign > 0 ? "green" : "red")};

	${({ percent }) =>
		percent &&
		`
		&::after {
			content: "%";
		}
	`};
`;

const DataCell = ({ value, percent, reverse }) =>
	<DataCellStyled
		percent={percent}
		sign={Math.sign(value) * (reverse ? -1 : 1)}
	>
		{(Math.abs(value) * (percent ? 100 : 1)).toFixed(2)}
	</DataCellStyled>;

const Exchange = ({ lhs, rhs, max, avg, min, importance, reverse }) =>
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
					<DataCell reverse={reverse} value={max.stdDev} />
					<td>
						{max.value.toPrecision(4)}
					</td>
					<DataCell reverse={reverse} percent value={max.delta} />
				</tr>

				<tr>
					<Header>x</Header>
					<DataCell reverse={reverse} value={avg.stdDev} />
					<td>
						{avg.value.toPrecision(4)}
					</td>
					<DataCell reverse={reverse} percent value={avg.delta} />
				</tr>

				<tr>
					<Header>⎣x⎦</Header>
					<DataCell reverse={reverse} value={min.stdDev} />
					<td>
						{min.value.toPrecision(4)}
					</td>
					<DataCell reverse={reverse} percent value={min.delta} />
				</tr>
			</tbody>
		</Table>
	</ExchangeStyled>;

const CurrencyContainer = styled.div`margin: 1em;`;

const Currency = ({ data, currency }) =>
	<CurrencyContainer>
		<h2>
			{" "}{currency}{" "}
		</h2>

		<ExchangesContainer>
			{R.pipe(
				R.filter(
					({ lhs, rhs }) => lhs === currency || rhs === currency,
				),
				R.sortBy(R.prop("importance")),
				R.reverse,
				R.map(props =>
					<Exchange
						key={props.lhs + props.rhs}
						{...props}
						reverse={currency === props.rhs}
					/>,
				),
			)(data)}
		</ExchangesContainer>
	</CurrencyContainer>;

export default data => {
	const Component = () =>
		<Root>
			<Title>
				Crypto Report ({moment().format("DD-MM-YY A")})
			</Title>

			{currencies.map(currency =>
				<Currency key={currency} data={data} currency={currency} />,
			)}

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
