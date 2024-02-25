

import { parseErrors } from './utilities'
import { useReducer } from 'react'
import { FilteredSet } from './data/definitions';


export const DEFAULT_DATA_LIMIT = 20
export type DataMode = 'idle' | 'loading' | 'error';
export type DatasetState = {
/** A high-level description of the current state of the app
 * (e.g., if it's loading or encountered an error). */
mode: DataMode;
/** The current set of data results returned by the API. Rows only, not metadata */
data: any[]
/** The the current query params, Defaults to {offset:0, limit:DEFAULT_DATA_LIMIT}. */
queryParams: Record<string, any>;
/** Total rows in the data set, returned by API */
totalRows: number;
//Error - can be object or string, will try to format with parseErrors()
error?: any;
};
export type DatasetAction = 
| { type: 'set-mode'; payload: DataMode }
| { type: 'set-search'; payload: string }
| { type: 'set-page'; payload: number }
| { type: 'set-rows-per-page'; payload: number }
| { type: 'set-error'; payload: any }
| { type: 'clear-search'}
| { type: 'set-data'; payload: { data: FilteredSet} }
| { type: 'reset'}

//used by reducer functions in pages that have search and pagination
export const useDataReducer = (reducer: (state: DatasetState, action: any) => DatasetState | void, initialState: DatasetState) => {
  const datasetHelper = (state: DatasetState, action: DatasetAction): DatasetState => {
    //first try the reducer that was passed in
    const result = reducer(state, action)
    if(result) return result
    switch (action.type) {
      case 'reset': {
        const newQueryParams = {offset: 0, limit: state.queryParams?.limit || DEFAULT_DATA_LIMIT};
        return {...initialState, queryParams: newQueryParams};
        }
        
      case 'set-mode': {
        if(state.mode == action.payload){
          return state
        }
        return { ...state, mode: action.payload };
      }
      case 'set-data': {
        const { data } = action.payload;
        const totalRows = data.count
        return { ...state, data: data.results, totalRows, mode: 'idle' };
      }
      case 'set-rows-per-page': {
        if(state.queryParams.limit === action.payload){
          return state
        }
        let newQueryParams = {...state.queryParams, limit: action.payload}
        return {...state, queryParams: newQueryParams};
      }
      case 'set-page': {
        let newOffset = (action.payload-1) * state.queryParams.limit
        if(newOffset == state.queryParams.offset){
          return state
        }
        let newQueryParams = {...state.queryParams, offset: newOffset}
        return {...state, queryParams: newQueryParams};
      }
      case 'set-error': {
        return {...state, error: parseErrors(action.payload)};
      }
      case 'clear-search': {
        const newQueryParams = {offset: 0, limit: state.queryParams?.limit || DEFAULT_DATA_LIMIT};
        if(JSON.stringify(state.queryParams) == JSON.stringify(newQueryParams)){
          return state
        }
        return {...state, queryParams: newQueryParams};
        
      }
      default:
        throw new Error('Invalid action type: ' + action.type)
    }
  };
  return useReducer(datasetHelper, initialState);
}

