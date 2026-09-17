export function storeIndexTemplate(): string {
    return `import { combineReducers, configureStore } from '@reduxjs/toolkit';

import { counterReducer } from './counter-slice';

const rootReducer = combineReducers({
    counter: counterReducer,
});

export function makeStore(preloadedState?: Partial<RootState>) {
    return configureStore({
        reducer: rootReducer,
        preloadedState,
    });
}

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];
`;
}

export function storeHooksTemplate(): string {
    return `import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch, RootState } from './index';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
`;
}

export function counterSliceTemplate(): string {
    return `import { createSlice } from '@reduxjs/toolkit';

type CounterState = {
    value: number;
};

const initialState: CounterState = {
    value: 0,
};

const counterSlice = createSlice({
    name: 'counter',
    initialState,
    reducers: {
        increment: (state) => {
            state.value += 1;
        },
        decrement: (state) => {
            state.value -= 1;
        },
    },
});

export const { decrement, increment } = counterSlice.actions;
export const counterReducer = counterSlice.reducer;
`;
}
