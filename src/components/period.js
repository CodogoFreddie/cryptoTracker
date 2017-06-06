import React from "react";
import styled from "styled-components";

const TextCell = styled.td`

`;

const NumCell = styled.td`
	font-family: monospace;
`;

export default ({ getDerived, lhs, rhs, n, unit, }) => {
	const min = getDerived(lhs, rhs, n, unit, "min");
	const avg = getDerived(lhs, rhs, n, unit, "avg");
	const stdDev = getDerived(lhs, rhs, n, unit, "stddev");
	const stability = Math.round(avg / stdDev);
	const max = getDerived(lhs, rhs, n, unit, "max");
	const count = getDerived(lhs, rhs, n, unit, "count");

	return (
		<tr>
			<TextCell> {n} {unit} </TextCell>

			<NumCell>
				{min}
			</NumCell>
			<NumCell>
				{avg}
			</NumCell>
			<NumCell>
				{stdDev}
			</NumCell>
			<NumCell>
				{stability}
			</NumCell>
			<NumCell>
				{max}
			</NumCell>
			<NumCell>
				{count}
			</NumCell>
		</tr>
	);
};
