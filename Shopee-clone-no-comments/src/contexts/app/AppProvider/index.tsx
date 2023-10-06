// react hooks
import { useState } from "react";
// interfaces:
import type { AppProviderInterface, ExtendPurchaseSuccessResponse, User } from "src/types";
// initial context, context to provide entire app:
import { AppContext } from "src/contexts/app";
import { initialAppContext } from "src/contexts/app/AppContext";

// Khai báo Provider
// - AppProvider: Đây là một React component chứa context provider. Nó nhận props children, là một phần tử con hoặc các phần tử con
// mà context sẽ bao bọc. Trong nội dung của Provider:
// -> Sử dụng useState để tạo biến trạng thái isLoggedIn và hàm setIsLoggedIn để cập nhật trạng thái.
// -> Sử dụng <AppContext.Provider> để cung cấp dữ liệu cho toàn bộ ứng dụng. Giá trị được truyền vào context là các biến trạng thái
// đã tạo. children là các phần tử con mà context sẽ bao bọc.
const AppProvider = ({ children }: AppProviderInterface) => {
	const [isLoggedIn, setIsLoggedIn] = useState<boolean>(initialAppContext.isLoggedIn);
	const [userProfile, setUserProfile] = useState<User | null>(initialAppContext.userProfile);
	const [extendPurchaseList, setExtendPurchaseList] = useState<ExtendPurchaseSuccessResponse[]>(
		initialAppContext.extendPurchaseList,
	);

	// reset isLoggedIn, userProfile và extendPurchaseList về giá trị ban đầu nhưng không được sử dụng initialAppContext
	// -> lý do là vì giá trị initialAppContext bản chất như 1 biến, nó đã bị thay đổi giá trị trong qua trình chúng ta sử dụng App, Loggin, Lưu UserProfile,..v...v...
	const resetIsLoggedInUserProfile = () => {
		setIsLoggedIn(false);
		setUserProfile(null);
		setExtendPurchaseList([]);
	};

	return (
		<AppContext.Provider
			// khi truyền value -> giá trị khởi tạo initialAppContext sẽ được thay thế = value
			// value có type = interface AppContextInterface
			value={{
				isLoggedIn,
				setIsLoggedIn,
				// khi ta vừa đăng nhập thành công -> userProfile được get ra từ localStorage (lúc đó userProfile === null)
				// -> khi đã đăng nhập thành công -> ta cần set lại userProfile trong local Storage để lưu mới thông tin user vừa đăng nhập.
				// -> ta sẽ tạo 1 state quản lý giống như việc quản lý isLoggedIn ở trên bằng hook useState
				// -> đang nhập thành công ta sẽ lấy user profile từ state của component này (đã được lưu)
				userProfile,
				setUserProfile,
				// Truyền extendPurchaseList và setExtendPurchaseList xuống app - phạm vi global
				extendPurchaseList,
				setExtendPurchaseList,
				// truyền hàm reset ra toàn app -> ra Component App lấy hàm reset nhằm reset khi bắt được sự kiện clear LS
				resetIsLoggedInUserProfile,
			}}
		>
			{children}
		</AppContext.Provider>
	);
};
export default AppProvider;
