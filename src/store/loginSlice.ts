import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
interface Userdata {
    email: string;
    password: string;
    token: string;
}
export const loginUser = createAsyncThunk(
    'login/loginUser',
    async (userData: Userdata, { rejectWithValue, fulfillWithValue }) => {
        try {
            return fulfillWithValue('Login successful!');
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                return rejectWithValue(err.response.data);
            }
            return rejectWithValue(err);
        }
    }
);

const loginSlice = createSlice({
    name: 'login',
    initialState: {
        data: null as string | null,
        loading: false,
        error: null as string | null,
        success: false,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.data = null;
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.data = action.payload as string | null;
                state.loading = false;
                state.error = null;
                state.success = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.data = null;
                state.loading = false;
                state.error = action.payload as string | null;
                state.success = false;
            });
    },
});

export default loginSlice.reducer;