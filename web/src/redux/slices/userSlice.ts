import { UserType } from "@/interface/User";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: UserType = {
  id: null,
  name: "",
  email: "",
  dateBirth: null,
  phone: null,
  role: 'USER',
  registrationDate: new Date().toISOString()
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserType>) => {
      return { ...action.payload };
    },
    clearUser: () => {
      localStorage.removeItem('user');
      return initialState
    }
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
