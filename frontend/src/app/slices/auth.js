import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Axios } from "../../lib/axios";
import toast from "react-hot-toast";

const initialState = {
  user: null,
  isLoggedIn: false,
  role: null,
};

export const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isLoggedIn = true;
      state.role = action.payload.role;
    },
    logout: (state) => {
      state.user = null;
      state.isLoggedIn = false;
    },
  },
});

export const { setUser, logout } = slice.actions;

export default slice.reducer;

export const Login = createAsyncThunk(
  "/auth/login",
  async (formData, { dispatch }) => {
    try {
      const { data } = await Axios.post("/auth/login", formData, {
        withCredentials: true,
      });
      if (data.success) {
        toast.success("Login successful");
        dispatch(setUser(data.user));
      }
    } catch (error) {
      console.error(error);
    }
  }
);

export const Logout = createAsyncThunk(
  "/auth/logut",
  async (_, { dispatch }) => {
    try {
      await Axios.get("/auth/logout", { withCredentials: true });
      dispatch(slice.actions.logout());
    } catch (error) {
      console.log(error);
    }
  }
);
