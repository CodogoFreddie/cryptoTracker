import shitFetch from "node-fetch";
import moment from "moment";
import R from "ramda";
import mysql from "mysql";

const ethAdresses = [
	"0x271d05428c965e2c487414166e3c5eec543f2f72",
];

const getEthAndErc20 = (address) => shitFetch(`https://api.ethplorer.io/getAddressInfo/${address}?apiKey=freekey`)
	.then( x => x.json() )
	.then( R.tap(x => console.log(JSON.stringify(x, null, 2))))

	.then( R.pipe(
		(data) => ({ data, tokens: {} }),

		({ data, tokens, }) => ({
			data,
			tokens: {
				...tokens,
				eth: R.path([ "ETH", "balance", ], data),
			}
		}),

		({ data, tokens, }) => ({
			data,
			tokens: {
				...tokens,
				...R.pipe(
					R.map( ({ tokenInfo, balance, }) => ([
						tokenInfo.symbol.toLowerCase(),

						balance / Math.pow(10, parseInt(tokenInfo.decimals, 10)),
					])),

					R.fromPairs,
				)(data.tokens),
			},
		}),

		R.prop("tokens"),
	))

	.then( R.tap(x => console.log(JSON.stringify(x, null, 2))))

const run = () => Promise.all([
	...[
		ethAdresses.map( addr => getEthAndErc20(addr) ),
	]
])

	//.then( R.tap(x => console.log(JSON.stringify(x, null, 2))))

run();
