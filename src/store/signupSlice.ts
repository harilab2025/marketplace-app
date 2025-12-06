import { AppConfig } from '@/lib/config';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
interface Userdata {
    name: string;
    email: string;
    password: string;
    whatsappNumber: string;
    recaptchaToken: string;
}
export const signupUser = createAsyncThunk(
    'signup/signupUser',
    async (userData: Userdata, { rejectWithValue }) => {
        try {
            const obj = {
                "name": userData.name,
                "email": userData.email,
                "password": userData.password,
                "whatsappNumber": userData.whatsappNumber,
                "recaptchaToken": userData.recaptchaToken
            }

            const response = await axios.post(`${AppConfig.apiBaseUrl}/auth/register`, obj, {
                headers: { 'Content-Type': 'application/json' }
            });
            return response.data;
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                return rejectWithValue(err.response.data);
            }
            return rejectWithValue(err);
        }
    }
);

const signupSlice = createSlice({
    name: 'signup',
    initialState: {
        loading: false,
        error: null as string | null,
        success: false,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(signupUser.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(signupUser.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
            })
            .addCase(signupUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string | null;
                state.success = false;
            });
    },
});

export default signupSlice.reducer;