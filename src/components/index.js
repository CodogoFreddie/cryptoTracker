import React from "react";
import R from "ramda";
import { renderToStaticMarkup, } from "react-dom/server";
import styled, { ServerStyleSheet, } from "styled-components";

import moment from "moment";

const Root = styled.div`font-family: sans-serif;`;

const Title = styled.h1`margin: 0;`;
const SubTitle = styled.h2`margin: 0;`;
const PairStyled = styled.div`
	border: black 1px solid;
	padding: 8px;
`;
const PairTitle = styled.div``;
const PairInfo = styled.div`display: flex;`;
const PairData = styled.div`
	font-family: monospace;
	white-space: pre;
`;

const Pair = ({ lhs, rhs, avg, }) =>
	<PairStyled>
		<PairTitle>
			{lhs.toUpperCase()} / {rhs.toUpperCase()}
		</PairTitle>
		<PairInfo>
			<img
				src = { `http://freddie-ridell-crypto-tracker-graphs.s3-website-eu-west-1.amazonaws.com/${lhs}-${rhs}-${moment().format(
					"DD-MM-YY-A",
				)}.png` }
				alt = "graph"
			/>
			<PairData>
				Average Value: {avg.value}
				<br />
				12 hour change: {avg.delta * avg.value}
				<br />
				Current Deviation: {avg.stdDev}
			</PairData>
		</PairInfo>
	</PairStyled>;

export default data => {
	const sortedData = R.pipe(
		R.filter(R.propEq("rhs", "usd")),
		R.sortBy(R.prop("importance")),
		R.reverse,
	)(data);

	const Component = () =>
		<Root>
			<Title>
				Crypto Report ({moment().format("DD-MM-YY A")})
			</Title>

			<SubTitle>CurrentValues</SubTitle>

			{sortedData.map(({ lhs, rhs, avg, }) =>
				<Pair key = { lhs + rhs } lhs = { lhs } rhs = { rhs } avg = { avg } />,
			)}

			<code style = { { whiteSpace: "pre", } }>
				{JSON.stringify(sortedData, null, 2)}
			</code>

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
