import { AsyncNodeStorage } from 'redux-persist-node-storage';
import { persistStore, autoRehydrate, } from "redux-persist";
import logger from "redux-logger";
import moment from "moment";
import R from "ramda";

import {
	compose,
	applyMiddleware,
	createStore,
	combineReducers,
} from "redux";

const generateReducer = (key) => (state = {}, action) => {
	if(action.key === key){
		const cutoffTimeStamp = moment().subtract(3, "month").unix();

		return R.pipe(
			R.toPairs,

			R.map( ([ timestamp, price, ]) => ({
				timestamp,
				price,
			})),

			(state) => R.remove(
				0,
				R.findLast( ({ timestamp, }) => timestamp < cutoffTimeStamp , state),
				state
			),

			R.append( action.entry ),

			R.map( ({ timestamp, price, }) => ([
				timestamp,
				price,
			])),

			R.fromPairs,

		)(state);
	}
	else {
		return state;
	}
};

const reducer = combineReducers(
	R.pipe(
		R.map( (key) => ([
			key,
			generateReducer(key),
		])),

		R.fromPairs,
	)(["btc_eth", "btc_gbp", "eth_gbp", ])
);


const store = createStore(
	reducer,
	compose(
		//applyMiddleware(logger),
		autoRehydrate(),
	)
)

export default store;
