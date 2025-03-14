'use client'

import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import { 
	setUser, 
	clearUser 
} from "@/redux/slices/userSlice";
import { RootState } from "@/redux/store";
import { isJsonString } from "./isJsonString";

export function SyncUserFromLocalStorage() {
	const user = useSelector((state: RootState) => state.user);
	const dispatch = useDispatch();	

	const updateUserFromLocalStorage = useCallback(() => {
		if(!dispatch || !localStorage) return;
		const userString = localStorage.getItem('user');
		
		if (userString && isJsonString(userString)) {
			const user = JSON.parse(userString);
			dispatch(setUser(user));
		} else {
			dispatch(clearUser()); 
			localStorage.removeItem('user');
		}
	}, [dispatch]);	
	
	if(user?.id || typeof dispatch === "undefined" || typeof localStorage === 'undefined') return;
	updateUserFromLocalStorage();
}