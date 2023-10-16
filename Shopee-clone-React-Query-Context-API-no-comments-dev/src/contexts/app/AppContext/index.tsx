// react hooks
import { createContext } from "react";
// utils -> authentication -> userProfile
// interfaces:
import type { AppContextInterface } from "src/types";
// authentication utils:
import { getAccessTokenFromLocalStorage, getUserProfileFromLocalStorage } from "src/utils";

// Khởi tạo giá trị ban đầu cho Context:
export const initialAppContext: AppContextInterface = {
	isLoggedIn: Boolean(getAccessTokenFromLocalStorage()),
	setIsLoggedIn: () => null,
	userProfile: getUserProfileFromLocalStorage(),
	setUserProfile: () => null,
	extendPurchaseList: [],
	setExtendPurchaseList: () => null,
	resetIsLoggedInUserProfile: () => null,
};

// Tạo Context:
const AppContext = createContext<AppContextInterface>(initialAppContext);
export default AppContext;
