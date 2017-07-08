import React from "react";
import { mix, } from "polished";
import styled from "styled-components";

const TextCell = styled.td``;

const NumCell = styled.td`
	font-family: monospace;
	${({ score, }) =>
		score ? `background-color: ${mix(score, "#f00", "#0f0")};` : ""};
`;

export default ({ getDerived, lhs, rhs, n, unit, }) => {
	const avg = getDerived(lhs, rhs, n, unit, "avg");
	const stdDev = getDerived(lhs, rhs, n, unit, "stddev");
	const stability = Math.round(avg / stdDev);
	const count = getDerived(lhs, rhs, n, unit, "count");

	return (
		<tr>
			<TextCell>
				{" "}{n} {unit}{" "}
			</TextCell>

			<NumCell>
				{avg}
			</NumCell>
			<NumCell>
				{stdDev}
			</NumCell>
			<NumCell score = { (stability - 10) / 200 }>
				{stability}
			</NumCell>
			<NumCell>
				{count}
			</NumCell>
		</tr>
	);
};
