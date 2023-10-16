// react hooks
import { useState } from "react";
// interfaces:
import type { AppProviderInterface, ExtendPurchaseSuccessResponse, User } from "src/types";
// initial context, context to provide entire app:
import { AppContext } from "src/contexts/app";
import { initialAppContext } from "src/contexts/app/AppContext";

const AppProvider = ({ children }: AppProviderInterface) => {
	const [isLoggedIn, setIsLoggedIn] = useState<boolean>(initialAppContext.isLoggedIn);
	const [userProfile, setUserProfile] = useState<User | null>(initialAppContext.userProfile);
	const [extendPurchaseList, setExtendPurchaseList] = useState<ExtendPurchaseSuccessResponse[]>(
		initialAppContext.extendPurchaseList,
	);

	// reset isLoggedIn, userProfile và extendPurchaseList về giá trị ban đầu nhưng không được sử dụng initialAppContext
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
