/* eslint-disable @typescript-eslint/no-explicit-any */
// react router dom:
import { useLocation } from "react-router-dom";
// Sử dụng {Helmet} từ react helmet async thay vì { Helmet } từ react-helmet -> handle vấn đề báo lỗi ở console Using UNSAFE_componentWillMount ...v...v.....
import { Helmet } from "react-helmet-async";
// lodash:
import omit from "lodash/omit";
// react hook form:
import { FormProvider, useForm, FieldErrors } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
// tanstack query
import { useMutation } from "@tanstack/react-query";
// react toastify:
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// i18n
import { useTranslation } from "react-i18next";
// api methods:
import { updateUserProfileApi } from "src/apis";
// types:
import { ChangeUserPasswordBodyType, ChangePasswordPickedFormData, ErrorResponseApi } from "src/types";
// schemas, utils:
import { isAxiosUnprocessableEntityError, changePasswordPickedSchema } from "src/utils";
// common components:
import { FormFieldRegister, ProfileTitle, FormInputFields, SubmitFormButton } from "src/components";

export default function ChangePassword() {
	const useFormMethods = useForm<ChangePasswordPickedFormData>({
		defaultValues: {
			password: "",
			new_password: "",
			confirm_password: "",
		},
		resolver: yupResolver<ChangePasswordPickedFormData>(changePasswordPickedSchema),
	});
	const {
		handleSubmit,
		formState: { errors: formErrors },
		setError,
		reset,
	} = useFormMethods;

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { mutateAsync: updateUserProfileMutationAsync, isLoading: changeUserPasswordLoading } = useMutation({
		mutationFn: (body: ChangeUserPasswordBodyType) => updateUserProfileApi(body as ChangeUserPasswordBodyType),
	});

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const onSubmit = handleSubmit(async (requestData) => {
		try {
			const response = await updateUserProfileMutationAsync(omit(requestData, ["confirm_password"]));
			const successMessage = response.data.message;
			if (successMessage) {
				toast.success(successMessage, {
					autoClose: 2000,
					position: "top-center",
				});
			}
			reset();
		} catch (error) {
			if (isAxiosUnprocessableEntityError<ErrorResponseApi<ChangePasswordPickedFormData>>(error)) {
				const formError = error.response?.data.data;
				if (formError) {
					Object.keys(formError).forEach((property) => {
						setError(property as keyof ChangePasswordPickedFormData, {
							message: formError[property as keyof ChangePasswordPickedFormData] as string,
							type: "ServerResponse",
						});
					});
				}
			}
		}
	});

	const { t } = useTranslation("user");

	const passwordPathname = useLocation().pathname;

	const myAccountProfileFields = [
		{
			key: "uniqueKey",
			fieldTitle: t("changePasswordContent.current password"),
			formPropertyName: "password",
			placeHolder: t("changePasswordContent.enter your current password"),
			errorObjectContainer: "password",
			errorMessage: "message",
		},
		{
			key: "uniqueKey",
			fieldTitle: t("changePasswordContent.new password"),
			formPropertyName: "new_password",
			placeHolder: t("changePasswordContent.enter your new password"),
			errorObjectContainer: "new_password",
			errorMessage: "message",
		},
		{
			key: "uniqueKey",
			fieldTitle: t("changePasswordContent.confirm new password"),
			formPropertyName: "confirm_password",
			placeHolder: t("changePasswordContent.confirm your new password"),
			errorObjectContainer: "confirm_password",
			errorMessage: "message",
		},
	];

	return (
		<div className='bg-white min-w-[993px] px-8 pb-[10px] rounded-sm myProfileBoxShadow'>
			<Helmet>
				<title>Thay đổi mật khẩu | Shopee clone</title>
				<meta name='description' content='Chức năng thay đổi mật khẩu - Dự án Shopee clone' />
			</Helmet>
			<ProfileTitle />
			<FormProvider {...useFormMethods}>
				<form action='' className='flex pt-[33.33px]' onSubmit={onSubmit}>
					<div className='pr-[100px] basis-[66.66%]'>
						<FormInputFields
							fields={[
								...myAccountProfileFields.map((myAccountProfileField) => {
									const { key, fieldTitle, formPropertyName, placeHolder, errorObjectContainer, errorMessage } =
										myAccountProfileField;
									return (
										<FormFieldRegister
											key={key as string}
											fieldTitle={fieldTitle as string}
											formPropertyName={formPropertyName as string}
											placeHolder={placeHolder as string}
											errorMessage={
												(formErrors as FieldErrors<ChangePasswordPickedFormData>) &&
												(formErrors as any)[errorObjectContainer as string] &&
												(formErrors as any)[errorObjectContainer as string][errorMessage as string] &&
												(formErrors as any)[errorObjectContainer as string][errorMessage as string]
											}
											pathname={`${passwordPathname}` as string}
										/>
									);
								}),
								<SubmitFormButton
									key={"uniqueKey1" as string}
									changeUserPasswordLoading={changeUserPasswordLoading as boolean}
									submitFormButtonTitle={t("content.save")}
								/>,
							]}
						/>
					</div>
				</form>
			</FormProvider>
		</div>
	);
}
