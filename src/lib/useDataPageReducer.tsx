import { DatasetState, DatasetAction, DEFAULT_DATA_LIMIT } from '../lib/data/definitions'
import { parseErrors } from '../lib/utilities'
import { useReducer } from 'react'


//used by reducer functions in pages that have search and pagination
export const useDataPageReducer = (reducer: (state: DatasetState, action: any) => DatasetState | void, initialState: DatasetState) => {
  const datasetHelper = (state: DatasetState, action: DatasetAction): DatasetState => {
    //first try the reducer that was passed in
    const result = reducer(state, action)
    if(result) return result
    switch (action.type) {
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

