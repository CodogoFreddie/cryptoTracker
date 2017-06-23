import R from "ramda";
import React from "react";
import styled from "styled-components";

import { currencies, } from "../pairs";
import periods from "../periods";
import sigFig from "../sigFig";

const Container = styled.div`
	margin: 1em 0;
`;

const Currency = styled.h2`
	margin: 0;
`;

const Table = styled.table`
	font-family: monospace;
	min-width: 800px;
    table-layout: fixed;
	width: 100%;
`;

const TitleCell = styled.td`
	font-family: sans-serif;
	font-weight: bold;
	text-align: center;
`;

const AverageRow = styled.tr`
`;

const ValueRow = styled.tr`
`;

const ValueCell = styled.td`
    border-top-color: black;
	border-top-style: solid;
	border-top-width: 1;
`;

const StdDevRow = styled.tr`
`;

const StdDevCell = styled.td`
    border-bottom-color: black;
	border-bottom-style: solid;
	border-bottom-width: 1;
`;

export default ({ currency, getValues, }) => {
	return (
		<Container>
			<Currency>{currency}</Currency>

			<Table>
				<tbody>
					<tr>
						<td />
						{periods.map(({ n, unit, }) => (
							<TitleCell key = { unit + n }>
								{n} {unit}
							</TitleCell>
						))}
					</tr>

					<AverageRow>
						<TitleCell rowSpan = "2">Avg</TitleCell>
						{periods.map(({ n, unit, }) => [
							<ValueCell>
								{sigFig(4)(
									R.mean(
										currencies
											.filter(x => x !== currency)
											.map(
												rhs =>
													getValues(
														currency,
														rhs,
														n,
														unit,
													).avg,
											),
									),
								)}

								{" "}

								(
								{sigFig(4)(
									R.mean(
										currencies
											.filter(x => x !== currency)
											.map(
												rhs =>
													getValues(
														currency,
														rhs,
														n,
														unit,
													).avgDelta,
											),
									),
								)}
								)

								{" "}

								[
								{sigFig(4)(
									R.mean(
										currencies
											.filter(x => x !== currency)
											.map(
												rhs =>
													getValues(
														currency,
														rhs,
														n,
														unit,
													).avgDeviations,
											),
									),
								)}
								]
							</ValueCell>,
						])}
					</AverageRow>

					<AverageRow>
						{periods.map(({ n, unit, }) => [
							<StdDevCell>
								{sigFig(4)(
									R.mean(
										currencies
											.filter(x => x !== currency)
											.map(
												rhs =>
													getValues(
														currency,
														rhs,
														n,
														unit,
													).stddev,
											),
									),
								)}

								{" "}

								(
								{sigFig(4)(
									R.mean(
										currencies
											.filter(x => x !== currency)
											.map(
												rhs =>
													getValues(
														currency,
														rhs,
														n,
														unit,
													).stddevDelta,
											),
									),
								)}
								)

								{" "}

								[
								{sigFig(4)(
									R.mean(
										currencies
											.filter(x => x !== currency)
											.map(
												rhs =>
													getValues(
														currency,
														rhs,
														n,
														unit,
													).stability,
											),
									),
								)}
								]
							</StdDevCell>,
						])}
					</AverageRow>

					{currencies.filter(x => x !== currency).map(rhs => [
						<ValueRow>
							<TitleCell rowSpan = "2">{rhs}</TitleCell>

							{periods.map(({ n, unit, }) => [
								<ValueCell>
									{sigFig(4)(
										getValues(currency, rhs, n, unit).avg,
									)}

									{" "}

									(
									{sigFig(4)(
										getValues(currency, rhs, n, unit)
											.avgDelta,
									)}
									)

									{" "}

									[
									{sigFig(4)(
										getValues(currency, rhs, n, unit)
											.avgDeviations,
									)}
									]
								</ValueCell>,
							])}
						</ValueRow>,
						<StdDevRow>
							{periods.map(({ n, unit, }) => [
								<StdDevCell>
									{sigFig(4)(
										getValues(currency, rhs, n, unit)
											.stddev,
									)}

									{" "}

									(
									{sigFig(4)(
										getValues(currency, rhs, n, unit)
											.stddevDelta,
									)}
									)

									{" "}

									(
									{sigFig(4)(
										getValues(currency, rhs, n, unit)
											.stability,
									)}
									)
								</StdDevCell>,
							])}
						</StdDevRow>,
					])}
				</tbody>
			</Table>
		</Container>
	);
};
