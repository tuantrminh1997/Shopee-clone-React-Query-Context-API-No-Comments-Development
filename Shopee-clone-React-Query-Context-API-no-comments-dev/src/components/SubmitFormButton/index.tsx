/* eslint-disable react-hooks/exhaustive-deps */
// react hook form:
import { useFormContext } from "react-hook-form";
// react hooks:
import { useMemo, memo } from "react";
// types
import { SubmitFormButtonPropsType } from "src/types";
// common components
import { Button } from "src/components";

export default memo(function SubmitFormButton({
	userProfileQueryLoading,
	updateUserProfileLoading,
	updateUserAvatarLoading,
	changeUserPasswordLoading,
	submitFormButtonTitle,
}: SubmitFormButtonPropsType) {
	const {
		formState: { errors: formErrors },
	} = useFormContext();

	// Biến quản lý trạng thái có errors từ form ???
	const hasErrorsInForm: boolean = useMemo(() => Object.keys(formErrors).length > 0, [Object.keys(formErrors).length]);
	// Biến quản lý trạng thái disable button submit
	// giá trị của biến isDisableSubmitFormButton phụ thuộc vào giá trị của 4 biến khác -> hoàn toàn chỉ cần tạo 1 biến để handle thông qua useMemo
	// -> không cần thiết phải tạo 1 state và quản lý bằng useState khiến phức tạp bài toán hơn.
	const isDisableSubmitFormButton = useMemo(
		() =>
			Object.keys(formErrors).length > 0 ||
			userProfileQueryLoading ||
			updateUserProfileLoading ||
			updateUserAvatarLoading ||
			changeUserPasswordLoading,
		// Chú ý: phải đưa vào dependency rõ ràng giá trị boolean của biểu thức Object.keys(formErrors).length > 0, nếu chỉ đưa formErrors thì sẽ luôn trả về true
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[
			hasErrorsInForm,
			userProfileQueryLoading,
			updateUserProfileLoading,
			updateUserAvatarLoading,
			changeUserPasswordLoading,
		],
	);
	return (
		<div className='flex'>
			<div className='flex items-center justify-end basis-[33.33%] pb-[30px] xl:hidden'></div>
			<div className='flex justify-left basis-[66.66%] pl-[20px] pb-[30px] xl:pl-0 xl:m-auto'>
				<Button
					className={`text-sm text-white px-5 py-[10px] rounded-sm  ${
						isDisableSubmitFormButton ? "bg-[#facac0]" : "bg-[#ee4d2d] hover:bg-[#f05d40]"
					} xl:m-auto capitalize`}
					childrenClassName={"m-auto"}
					disabled={isDisableSubmitFormButton}
				>
					{submitFormButtonTitle}
				</Button>
			</div>
		</div>
	);
});
