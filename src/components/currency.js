import R from "ramda";
import React from "react";
import styled from "styled-components";

import { currencies, } from "../pairs";
import periods from "../periods";
import sigFig from "../sigFig";

const Currency = styled.h2`
	margin: 0;
`;

const Table = styled.table`
	font-family: monospace;
	min-width: 500px;
    table-layout: fixed;
	width: 100%;
`;

const TitleCell = styled.td`
	font-family: sans-serif;
	font-weight: bold;
	text-align: center;
`;

const AverageRow = styled.tr`
    border-bottom-color: black;
	border-bottom-style: solid;
	border-bottom-width: 1;
`;

const ValueCell = styled.td`
    border-left-color: black;
	border-left-style: solid;
	border-left-width: 1;
	margin-right: 0.5em;
	text-align: right;
`;

const StdDevCell = styled.td`
    border-right-color: black;
	border-right-style: solid;
	border-right-width: 1;
	margin-left: 0.5em;
	text-align: left;
`;

export default ({ currency, getDerived, }) => {
	return (
		<div>
			<Currency>{currency}</Currency>

			<Table>
				<tbody>
					<tr>
						<td />
						{periods.map(({ n, unit, }) => (
							<TitleCell key = { unit + n } colSpan = "2">
								{n} {unit}
							</TitleCell>
						))}
					</tr>

					<AverageRow>
						<TitleCell>Avg</TitleCell>
						{periods.map(({ n, unit, }) => [
							<ValueCell>
								{sigFig(5)(
									R.mean(
										currencies
											.filter(x => x !== currency)
											.map(rhs =>
												getDerived(
													currency,
													rhs,
													n,
													unit,
													"avg",
												),
											),
									),
								)}
							</ValueCell>,
							<StdDevCell>
								{sigFig(5)(
									R.mean(
										currencies
											.filter(x => x !== currency)
											.map(rhs =>
												getDerived(
													currency,
													rhs,
													n,
													unit,
													"stddev",
												),
											),
									),
								)}
							</StdDevCell>,
						])}
					</AverageRow>

					{currencies.filter(x => x !== currency).map(rhs => (
						<tr key = { rhs }>
							<TitleCell>{rhs}</TitleCell>

							{periods.map(({ n, unit, }) => [
								<ValueCell>
									{getDerived(currency, rhs, n, unit, "avg")}
								</ValueCell>,
								<StdDevCell>
									{getDerived(
										currency,
										rhs,
										n,
										unit,
										"stddev",
									)}
								</StdDevCell>,
							])}
						</tr>
					))}
				</tbody>
			</Table>
		</div>
	);
};
