import shitFetch from "node-fetch";
import R from "ramda";

export default (a, b) => shitFetch(`https://api.cryptonator.com/api/ticker/${a}-${b}`)
	.then( x => x.json() )
	.then( ({ ticker, timestamp, }) => ({
		timestamp,
		price: parseFloat(R.prop("price")(ticker), 10),
		key: R.prop("base")(ticker).toLowerCase() + "_" + R.prop("target")(ticker).toLowerCase(),
	}));
