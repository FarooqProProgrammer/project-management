import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { apiSlice } from './services/apiSlice'; 
import storage from 'redux-persist/lib/storage'; 
import { persistReducer, persistStore } from 'redux-persist';
import { combineReducers } from 'redux';
import logger from 'redux-logger';
import tasksReducer from './slice/tasksSlice';

// Combine all reducers
const rootReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  tasks: tasksReducer,
});

// Configure Redux Persist
const persistConfig = {
  key: 'root', 
  storage, 
  whitelist: [apiSlice.reducerPath],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure the store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Required to handle non-serializable data from Redux Persist
    }).concat(apiSlice.middleware, logger), // Add logger here
});

// Optional: Enable listener behaviors
setupListeners(store.dispatch);

// Persistor for persisting the store
export const persistor = persistStore(store);

// Export store types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
