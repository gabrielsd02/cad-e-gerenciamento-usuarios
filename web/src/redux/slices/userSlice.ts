import { UserType } from "@/interface/User";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: UserType = {
  id: null,
  name: "",
  email: "",
	dateBirth: null,
	phone: null,
	role: 'USER'
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserType>) => {
      return { ...action.payload };
    },
    clearUser: () => initialState,
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
