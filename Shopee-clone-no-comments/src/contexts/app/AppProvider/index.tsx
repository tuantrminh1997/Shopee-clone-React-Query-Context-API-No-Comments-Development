import { useState } from "react";

import type { AppProviderInterface, ExtendPurchaseSuccessResponse, User } from "src/types";

import { AppContext } from "src/contexts/app";
import { initialAppContext } from "src/contexts/app/AppContext";

const AppProvider = ({ children }: AppProviderInterface) => {
	const [isLoggedIn, setIsLoggedIn] = useState<boolean>(initialAppContext.isLoggedIn);
	const [userProfile, setUserProfile] = useState<User | null>(initialAppContext.userProfile);
	const [extendPurchaseList, setExtendPurchaseList] = useState<ExtendPurchaseSuccessResponse[]>(
		initialAppContext.extendPurchaseList,
	);

	const resetIsLoggedInUserProfile = () => {
		setIsLoggedIn(false);
		setUserProfile(null);
		setExtendPurchaseList([]);
	};

	return (
		<AppContext.Provider
			value={{
				isLoggedIn,
				setIsLoggedIn,

				userProfile,
				setUserProfile,

				extendPurchaseList,
				setExtendPurchaseList,

				resetIsLoggedInUserProfile,
			}}
		>
			{children}
		</AppContext.Provider>
	);
};
export default AppProvider;
