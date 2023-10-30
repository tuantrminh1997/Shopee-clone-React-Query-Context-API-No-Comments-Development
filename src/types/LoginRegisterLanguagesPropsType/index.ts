import { AuthenticationSuccessResponse, User } from "src/types";

interface LoginRegisterLanguagesPropsType {
	isLoggedIn: boolean;
	userProfile: AuthenticationSuccessResponse | User | null;
	handleLogout: () => void;
	isHeaderForCartLayout?: boolean;
}
export default LoginRegisterLanguagesPropsType;
