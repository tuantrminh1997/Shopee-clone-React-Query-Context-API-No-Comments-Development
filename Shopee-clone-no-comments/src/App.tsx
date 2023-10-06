// react toastify:
import { ToastContainer } from "react-toastify";
// react hooks:
import { useEffect, useContext } from "react";
// custome hooks:
import { useRouteElements } from "src/hooks";
// event target:
import { clearLocalStorageEventTarget, clearAccessTokenUserProfileEventMessage } from "src/utils";
import "react-toastify/dist/ReactToastify.css";
// contexts:
import { AppContext } from "src/contexts/app";

function App() {
	// cusome hook useRouteElements được custome từ hook useRoutes của react-router-dom -> url thay đổi -> mặc định component App thay đổi
	// -> App bị re-render
	const routeElements = useRouteElements();
	const { resetIsLoggedInUserProfile } = useContext(AppContext);

	// Lắng nghe event sau khi clear dữ liệu accessToken, userProfile trong Local Storage do access_token đang sử dụng không còn đúng (bị sai/hết hạn -> server trả về lỗi 401)
	// Chú ý: khi ta cần thực hiện 1 side effect nào đó bằng cách lắng nghe 1 cái gì đó -> sử dụng useEffect
	useEffect(() => {
		// Ngay khi component App được mounted (ứng dụng được chạy) => callback của useEffect đã được gọi, và đã sinh ra event này
		clearLocalStorageEventTarget.addEventListener(
			// Nhận được event message rằng đã clear xong access_token và user_profile trong Local Storage
			clearAccessTokenUserProfileEventMessage,
			// tác vụ được thực thi khi bắt được event message
			// -> khai báo tác vụ reset isLoggedIn và userProfile tại Context API.
			resetIsLoggedInUserProfile,
		);
		// clean up function:
		return () =>
			clearLocalStorageEventTarget.removeEventListener(
				clearAccessTokenUserProfileEventMessage,
				resetIsLoggedInUserProfile,
			);
	}, [resetIsLoggedInUserProfile]);

	return (
		<div>
			{routeElements}
			<ToastContainer />
		</div>
	);
}

export default App;
