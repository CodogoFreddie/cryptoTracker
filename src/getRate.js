import shitFetch from "node-fetch";
import R from "ramda";

export default (a, b) => shitFetch(`https://api.cryptonator.com/api/ticker/${a}-${b}`)
	.then( x => x.json() )
	.then( ({ ticker, timestamp, }) => ({
		timestamp,
		price: R.prop("price")(ticker),
		key: R.prop("base")(ticker).toLowerCase() + "_" + R.prop("target")(ticker).toLowerCase(),
	}));
