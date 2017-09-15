import shitFetch from "node-fetch";
import moment from "moment";
import R from "ramda";
import mysql from "mysql";

const ethAdresses = [
	"0x271d05428c965e2c487414166e3c5eec543f2f72",
	"0x271d05428c965e2c487414166e3c5eec543f2f72",
];

const dogeAdresses = [
	"DTnt7VZqR5ofHhAxZuDy4m3PhSjKFXpw3e",
	"DTnt7VZqR5ofHhAxZuDy4m3PhSjKFXpw3e",
];

const getEthAndErc20 = address =>
	shitFetch(
		`https://api.ethplorer.io/getAddressInfo/${address}?apiKey=freekey`,
	)
		.then(x => x.json())
		.then(
			R.pipe(
				data => ({ data, tokens: {}, }),
				({ data, tokens, }) => ({
					data,
					tokens: {
						...tokens,
						eth: R.path(["ETH", "balance",], data),
					},
				}),
				({ data, tokens, }) => ({
					data,
					tokens: {
						...tokens,
						...R.pipe(
							R.map(({ tokenInfo, balance, }) => [
								tokenInfo.symbol.toLowerCase(),

								balance /
									Math.pow(
										10,
										parseInt(tokenInfo.decimals, 10),
									),
							]),
							R.fromPairs,
						)(data.tokens),
					},
				}),
				R.prop("tokens"),
			),
		);
//.then(R.tap(x => console.log(JSON.stringify(x, null, 2))));

const getDoge = address =>
	shitFetch(`https://chain.so/api/v2/get_address_balance/DOGE/${address}`)
		.then(x => x.json())
		.then(R.path(["data", "confirmed_balance",]))
		.then(x => ({
			doge: parseInt(x, 10),
		}));

const run = () =>
	Promise.all([
		...ethAdresses.map(addr => getEthAndErc20(addr)),
		...dogeAdresses.map(addr => getDoge(addr)),
	])
		.then(
			R.reduce(
				(acc, val) =>
					R.toPairs(val).reduce(
						(acc, [symbol, value,]) => ({
							...acc,
							[symbol]: (acc[symbol] || 0) + value,
						}),
						acc,
					),
				{},
			),
		)
		.then(R.tap(x => console.log(JSON.stringify(x, null, 2))));

run();
