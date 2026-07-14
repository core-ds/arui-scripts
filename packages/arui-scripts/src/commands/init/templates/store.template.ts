export function storeIndexTemplate(): string {
    return `import { configureStore } from '@reduxjs/toolkit';

import { counterReducer } from './counter-slice';

export const store = configureStore({
    reducer: {
        counter: counterReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
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

export const { increment, decrement } = counterSlice.actions;
export const counterReducer = counterSlice.reducer;
`;
}
