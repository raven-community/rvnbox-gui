import { createStore } from 'redux'
import rvnboxReducer from '../reducers/rvnbox'

let reduxStore = createStore(rvnboxReducer);
export default reduxStore;
