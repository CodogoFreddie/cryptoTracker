import React from "react";
import styled from "styled-components";

import periods from "../periods";
import Period from "./period";

const Exchange = styled.div`margin: 1em;`;

const Title = styled.h2`margin: 0;`;

const Table = styled.table`
	min-width: 500px;
	table-layout: fixed;
	width: 100%;
`;

export default ({ getDerived, lhs, rhs, }) =>
	<Exchange>
		<Title>
			{lhs} / {rhs}
		</Title>

		<Table>
			<tbody>
				<tr>
					<td>Period</td>
					<td>Average</td>
					<td>Std Dev</td>
					<td>Stability</td>
					<td>Data Points</td>
				</tr>

				{periods.map(({ n, unit, }) =>
					<Period
						key = { n + unit }
						getDerived = { getDerived }
						lhs = { lhs }
						rhs = { rhs }
						n = { n }
						unit = { unit }
					/>,
				)}
			</tbody>
		</Table>
	</Exchange>;
