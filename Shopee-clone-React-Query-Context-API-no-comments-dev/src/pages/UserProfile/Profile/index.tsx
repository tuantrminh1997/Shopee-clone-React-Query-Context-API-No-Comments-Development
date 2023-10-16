/* eslint-disable @typescript-eslint/no-explicit-any */
// Sử dụng {Helmet} từ react helmet async thay vì { Helmet } từ react-helmet -> handle vấn đề báo lỗi ở console Using UNSAFE_componentWillMount ...v...v.....
import { Helmet } from "react-helmet-async";
// react hooks:
import { useCallback, useEffect, useContext, useMemo, useState } from "react";
// react hook form:
import { Controller, FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
// tanstack query
import { useMutation, useQuery } from "@tanstack/react-query";
// react toastify:
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// i18n
import { useTranslation } from "react-i18next";
// api methods:
import { getUserProfileApi, updateUserProfileApi, updateUserAvatarApi } from "src/apis";
// types:
import { UserProfilePickedFormData, UpdateUserProfileBodyType, SuccessResponseApi, User } from "src/types";
import { AxiosResponse } from "axios";
// schemas, utils:
import {
	// Phương thức lấy ra file ảnh phù hợp
	getTruthyImageFileSize,
	getTruthyImageFileExtension,
	getTruthyImageFileType,
	getCurrentFileSizeAsMB,
	userProfilePickedSchema,
	saveUserProfileToLocalStorage,
	getFileExtension,
	getUserAvatarUrl,
} from "src/utils";
// constants:
import { myAccountUploadUserAvatarConstants } from "src/constants";
// context API:
import { AppContext } from "src/contexts/app";
// private components:
import {
	UploadAvatar,
	// fields
	DateOfBirthSelection,
	UpdateAddress,
	UpdateEmail,
	UpdatePhoneNumber,
} from "./components";
// common components:
import { SubmitFormButton, FormFieldRegister, ProfileTitle, FormInputFields } from "src/components";

export default function Profile() {
	// App Context
	// Sau khi submit form
	// -> cập nhật thông tin User thành công  bằng phương thức PUT
	// -> refetch lại user profile bằng userProfileQueryRefetch (phương thức GET)
	const { setUserProfile, userProfile } = useContext(AppContext);

	// constants:
	const { userAvatarMaxSizeAsBytes, fileExtension01, fileExtension02 } = myAccountUploadUserAvatarConstants;

	// Query quản lý tác vụ call API -> get thông tin User
	const {
		data: userProfileQueryData,
		refetch: userProfileQueryRefetch,
		isLoading: userProfileQueryLoading,
	} = useQuery<AxiosResponse<SuccessResponseApi<User>, any>>({
		queryKey: ["userProfile"],
		queryFn: () => getUserProfileApi(),
	});
	const userProfileData = userProfileQueryData?.data.data;

	// Mutation quản lý tác vụ call API -> update form
	const { mutateAsync: updateUserProfileMutateAsync, isLoading: updateUserProfileLoading } = useMutation({
		mutationFn: (body: UpdateUserProfileBodyType) => updateUserProfileApi(body as UpdateUserProfileBodyType),
	});

	// Mutation quản lý tác vụ call API -> update user avatar
	const { mutateAsync: updateUserAvatarMutateAsync, isLoading: updateUserAvatarLoading } = useMutation({
		mutationFn: (body: FormData) => updateUserAvatarApi(body as FormData),
	});

	const useFormMethods = useForm<UserProfilePickedFormData>({
		defaultValues: {
			name: "",
			address: "",
			avatar: "",
			phone: "",
			date_of_birth: new Date(1990, 1, 1),
		},
		resolver: yupResolver<UserProfilePickedFormData>(userProfilePickedSchema),
	});

	// Đặt phần khai bso useFormMethods dưới useForm
	const {
		control,
		handleSubmit,
		setValue,
		watch,
		formState: { errors: formErrors },
	} = useFormMethods;

	// Sau khi nhận được dữ liệu userProfileData từ API -> dùng useEffect + setValue (React Hook Form để map các giá trị tương ứng với các thẻ Input trong Form)
	useEffect(() => {
		if (userProfileData) {
			setValue("name", userProfileData.name);
			setValue("phone", userProfileData.phone);
			setValue("address", userProfileData.address);
			setValue("avatar", userProfileData.avatar);
			setValue(
				"date_of_birth",
				userProfileData.date_of_birth ? new Date(userProfileData.date_of_birth) : new Date(1990, 1, 1),
			);
		}
	}, [userProfileData, setValue]);

	// Handle chức năng upload ảnh:
	const [userAvatar, setUserAvatar] = useState<File>();
	const previewAvatar: string = useMemo(
		() => (userAvatar ? URL.createObjectURL(userAvatar) : getUserAvatarUrl(userProfile?.avatar as string)),
		[userAvatar, userProfile?.avatar],
	);

	// Method quản lý submit data form
	const onSubmit = handleSubmit(async (formDataSuccessSchemaRules) => {
		try {
			let userAvatarTryBlockScope;
			if (userAvatar) {
				const formData = new FormData();
				formData.append("image", userAvatar);
				const updateUserProfileResponse = await updateUserAvatarMutateAsync(formData as FormData);
				const userAvatarResponse = (updateUserProfileResponse as AxiosResponse<SuccessResponseApi<string>, any>).data
					.data as string;
				userAvatarTryBlockScope = userAvatarResponse;
				setValue("avatar", userAvatarTryBlockScope);
			}
			const updateUserProfileResponse = await updateUserProfileMutateAsync({
				...formDataSuccessSchemaRules,
				date_of_birth: formDataSuccessSchemaRules?.date_of_birth?.toISOString(),
				avatar: userAvatarTryBlockScope,
			});
			userProfileQueryRefetch();
			toast.success(
				(updateUserProfileResponse as AxiosResponse<SuccessResponseApi<User>, any>).data.message as string,
				{
					autoClose: 1500,
				},
			);
			setUserProfile((updateUserProfileResponse as AxiosResponse<SuccessResponseApi<User>, any>).data.data as User);
			saveUserProfileToLocalStorage(
				(updateUserProfileResponse as AxiosResponse<SuccessResponseApi<User>, any>).data.data as User,
			);
		} catch (errors) {
			console.log("submit user profile errors: ", errors);
		}
	});

	// Khởi tạo biến userAvatarFromForm -> truyền sang Component UploadAvatar để lấy dữ liệu avatar từ Form
	const userAvatarFromForm = watch("avatar");

	// Method quản lý chức năng upload avatar từ local lên preview (vẫn ở local):
	const handleSetUserAvatar: (fileFromLocal: File) => void = useCallback(
		(fileFromLocal: File) => {
			const currentFileSizeAsMB = getCurrentFileSizeAsMB((fileFromLocal as File).size);
			const truthyImageFileSize = getTruthyImageFileSize(
				(fileFromLocal as File).size as number,
				userAvatarMaxSizeAsBytes as number,
			);
			const fileExtension = getFileExtension((fileFromLocal as File).type);
			const truthyImageFileExtension = getTruthyImageFileExtension(fileExtension as string);
			const truthyImageFileType = getTruthyImageFileType((fileFromLocal as File).type);
			if ((fileFromLocal as File) && (!truthyImageFileSize || !truthyImageFileType)) {
				console.log("Upload Avatar Errors: ", fileFromLocal);
				currentFileSizeAsMB;
				toast.error(
					`Chọn ảnh thất bại, file bạn vừa chọn có dung lượng ${currentFileSizeAsMB}MB là ${
						truthyImageFileSize ? "phù hợp" : "quá lớn"
					}; định dạng .${fileExtension} là ${truthyImageFileExtension ? "phù hợp" : "không phù hợp"}, ${
						truthyImageFileSize && !truthyImageFileExtension
							? `kích thước file đã phù hợp tuy nhiên hãy chọn 1 file đúng định dạng ${fileExtension01}, ${fileExtension02}.`
							: ""
					} ${
						!truthyImageFileSize && truthyImageFileExtension
							? "định dạng file đã phù hợp tuy nhiên hãy chọn 1 file ảnh khác có kích thước nhỏ hơn 1MB."
							: ""
					} ${
						!truthyImageFileSize && !truthyImageFileExtension
							? "cả kích thước file lẫn định dạng file đều không phù hợp, hãy lựa chọn 1 file ảnh khác phù hợp hơn."
							: ""
					}` as string,
					{
						autoClose: 3000,
					},
				);
			} else {
				setUserAvatar(fileFromLocal);
				toast.success("Chọn ảnh thành công, nhấn Lưu để tiến hành đồng bộ với Server" as string, {
					autoClose: 2000,
					position: "top-center",
				});
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);

	const { t } = useTranslation("user");

	return (
		<div className='bg-white min-w-[993px] px-8 pb-[10px] rounded-sm myProfileBoxShadow xl:min-w-full'>
			<Helmet>
				<title>Cập nhật thông tin tài khoản | Shopee clone</title>
				<meta name='description' content='Chức năng cập nhật thông tin tài khoản - Dự án Shopee clone' />
			</Helmet>
			<ProfileTitle />
			<FormProvider {...useFormMethods}>
				<form action='' className='flex pt-[33.33px] xl:grid xl:grid-cols-1' onSubmit={onSubmit}>
					<div className='pr-[100px] basis-[66.66%] xl:pr-0'>
						<FormInputFields
							fields={[
								<FormFieldRegister
									type={"text"}
									key={"uniqueKey" as string}
									fieldTitle={t("content.username")}
									formPropertyName={"name"}
									placeHolder={"Nhập tên hiển thị..."}
									errorMessage={formErrors?.name?.message as string}
								/>,
								<UpdateEmail
									emailFieldTitle={t("content.email")}
									key={"uniqueKey" as string}
									userProfileData={userProfileData}
								/>,
								<UpdatePhoneNumber phoneNumberFieldTitle={t("content.phone number")} key={"uniqueKey" as string} />,
								<UpdateAddress addressFieldTitle={t("content.address")} key={"uniqueKey" as string} />,
								<Controller
									key={"uniqueKey" as string}
									control={control}
									name='date_of_birth'
									render={({ field }) => (
										<DateOfBirthSelection
											dateOfBirthSelectionFieldTitle={t("content.date of birth")}
											errorMessage={formErrors?.date_of_birth?.message as string}
											dateOfBirthValue={field.value}
											onChange={field.onChange}
										/>
									)}
								/>,
								<SubmitFormButton
									key={"uniqueKey" as string}
									userProfileQueryLoading={userProfileQueryLoading as boolean}
									updateUserProfileLoading={updateUserProfileLoading as boolean}
									updateUserAvatarLoading={updateUserAvatarLoading as boolean}
									submitFormButtonTitle={t("content.save")}
								/>,
							]}
						/>
					</div>
					<UploadAvatar
						userAvatarFromForm={userAvatarFromForm as string}
						previewAvatar={previewAvatar as string}
						onSetUserAvatar={handleSetUserAvatar as (fileFromLocal: File) => void}
					/>
				</form>
			</FormProvider>
		</div>
	);
}
