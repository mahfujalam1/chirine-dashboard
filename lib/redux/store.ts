import { configureStore } from "@reduxjs/toolkit";
import baseApis from "./baseApis";

const store = configureStore({
    reducer: {
        [baseApis.reducerPath]: baseApis.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(baseApis.middleware),
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store;