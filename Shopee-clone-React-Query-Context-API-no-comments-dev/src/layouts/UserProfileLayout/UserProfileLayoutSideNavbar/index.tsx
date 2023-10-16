// react router dom:
import { useLocation } from "react-router-dom";
// react hooks:
import { useMemo, useContext, memo } from "react";
// contexts:
import { AppContext } from "src/contexts/app";
// utils:
import { isUserAccountPath } from "src/utils";
// private components:
import { AvatarName, MyAccount, PurchaseList } from "./components";

function UserProfileLayoutSideNavbarInner() {
	const { userProfile } = useContext(AppContext);

	// Biến quản lý path url
	const currentUrlPathName = useLocation().pathname;

	// Biến quản lý trạng thái route: Tài khoản của tôi ???
	const isOpenMyAccountNavbar = useMemo(() => isUserAccountPath(currentUrlPathName), [currentUrlPathName]);

	return (
		<div className='max-w-[180px] min-w-[168px] flex flex-col border xl:mx-3'>
			<AvatarName userProfile={userProfile} />
			<div className='pt-7'>
				<MyAccount isOpenMyAccountNavbar={isOpenMyAccountNavbar} />
				<PurchaseList />
			</div>
		</div>
	);
}
const UserProfileLayoutSideNavbar = memo(UserProfileLayoutSideNavbarInner);
export default UserProfileLayoutSideNavbar;
