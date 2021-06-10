import { configureStore, combineReducers, createSlice, getDefaultMiddleware } from '@reduxjs/toolkit';
import moment from 'moment';

export const eventsSlice = createSlice({
  name: 'events',
  initialState: {
    selectedEventId: null,
    eventsList: null,
    eventsError: null,
    filters: {
      status: 'all-events',
      type: 'all-types',
    },
  },
  reducers: {
    setSelectedEvent: (state, action) => {
      state.selectedEventId = action.payload.selectedEventId;
    },
    setEventsList: (state, action) => {
      state.eventsList = action.payload;
    },
    setError: (state, action) => {
      state.eventsListError = action.payload;
    },

    setStatusFilter: (state, action) => {
      state.filters.status = action.payload;
    },

    setTypeFilters: (state, action) => {
      state.filters.type = action.payload;
    },
  },
});

export const datesSlice = createSlice({
  name: 'dates',
  initialState: {
    selectedDate: moment.utc(),
  },
  reducers: {
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
  },
});

export const authSlice = createSlice({
  name: 'auth',
  initialState: {
    anonToken: null,
    apiKey: null,
  },
  reducers: {
    setAnonToken: (state, action) => {
      state.anonToken = action.payload;
    },
    setApiKey: (state, action) => {
      state.apiKey = action.payload;
    },
  },
});

const reducers = combineReducers({
  events: eventsSlice.reducer,
  dates: datesSlice.reducer,
  auth: authSlice.reducer,
});

const store = configureStore({
  reducer: reducers,
  middleware: getDefaultMiddleware({
    serializableCheck: false,
  }),
}); // Due to "A non-serializable value was detected in an action" => https://github.com/rt2zz/redux-persist/issues/988
export default store;
