// react hooks
import { createContext } from "react";
// utils -> authentication -> userProfile
// interfaces:
import type { AppContextInterface } from "src/types";
// authentication utils:
import { getAccessTokenFromLocalStorage, getUserProfileFromLocalStorage } from "src/utils";

// Khởi tạo giá trị ban đầu cho Context:
export const initialAppContext: AppContextInterface = {
	// Lấy access Token trong localStorage -> nếu đã loggedIn -> getAccessTokenFromLocalStorage() = truthy
	//                                     -> nếu chưa loggedIn -> getAccessTokenFromLocalStorage() = falsy
	isLoggedIn: Boolean(getAccessTokenFromLocalStorage()),
	setIsLoggedIn: () => null,
	// Lấy thông tin userProfile sau khi đã đăng nhập được lưu trong localStorage ->
	userProfile: getUserProfileFromLocalStorage(),
	setUserProfile: () => null,
	// Context quản lý extend Purchase List (Purchase List sau khi ghi đè thêm thuộc tính isCheck, disable)
	extendPurchaseList: [],
	setExtendPurchaseList: () => null,
	resetIsLoggedInUserProfile: () => null,
};

// Tạo Context:
// AppContext - 1 instance của context, được tạo bằng createContext và truyền vào kiểu dữ liệu AppContextInterface. Điều này định
// nghĩa kiểu dữ liệu của dữ liệu mà context sẽ chia sẻ.
// -> type interface AppContextInterface = data type của value được truyền vào AppContext.Provider
const AppContext = createContext<AppContextInterface>(initialAppContext);
export default AppContext;
