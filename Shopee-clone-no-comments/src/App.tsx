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
	const routeElements = useRouteElements();
	const { resetIsLoggedInUserProfile } = useContext(AppContext);
	useEffect(() => {
		clearLocalStorageEventTarget.addEventListener(clearAccessTokenUserProfileEventMessage, resetIsLoggedInUserProfile);
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
