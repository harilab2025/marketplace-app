import { configureStore } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';
import signupReducer from './signupSlice';
import loginReducer from './loginSlice';
import productsReducer from './productsSlice';
import categoriesReducer from './categoriesSlice';
import usersReducer from './usersSlice';
import ordersReducer from './ordersSlice';
import cacheReducer from './cacheSlice';

const logger = createLogger({
    collapsed: true,
    timestamp: false,
    diff: true
});

const middleware = process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_REDUX_LOGGER === 'true'
    ? [logger]
    : [];

export const store = configureStore({
    reducer: {
        signup: signupReducer,
        login: loginReducer,
        products: productsReducer,
        categories: categoriesReducer,
        users: usersReducer,
        orders: ordersReducer,
        cache: cacheReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(middleware),
    devTools: process.env.NODE_ENV !== 'production'
});

// Dispatch action untuk log initial state
// if (process.env.NODE_ENV !== 'production') {
//     store.dispatch({ type: '@@INIT_LOGGER/GET_INITIAL_STATE' });
// }

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;