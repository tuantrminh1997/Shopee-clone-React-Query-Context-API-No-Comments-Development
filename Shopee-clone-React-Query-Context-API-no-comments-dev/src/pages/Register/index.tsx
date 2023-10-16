// libraries
// react hooks:
import { useContext, useMemo, useState } from "react";
// yup:
import { yupResolver } from "@hookform/resolvers/yup";
// react hook form:
import { useForm } from "react-hook-form";
// react-router-dom:
import { Link, useLocation, useNavigate } from "react-router-dom";
// react query:
import { useMutation } from "@tanstack/react-query";
// lodash:
import omit from "lodash/omit";
// Sử dụng {Helmet} từ react helmet async thay vì { Helmet } từ react-helmet -> handle vấn đề báo lỗi ở console Using UNSAFE_componentWillMount ...v...v.....
import { Helmet } from "react-helmet-async";
// i18n
import { useTranslation } from "react-i18next";
// types:
import { FormRulesSchema, ErrorResponseApi, User } from "src/types";
// form rules:
import { isAxiosUnprocessableEntityError, formRulesSchema } from "src/utils";
// apis:
import { registerApi } from "src/apis";
// App Context:
import { AppContext } from "src/contexts/app";
// common components:
import { Input, Button } from "src/components";
import { paths } from "src/constants";
import { toast } from "react-toastify";

export default function Register() {
	// App Context:
	const { setIsLoggedIn, setUserProfile } = useContext(AppContext);
	const navigate = useNavigate();
	// data trong callback của handleSubmit sẽ có type = FormData
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors },
	} = useForm<FormRulesSchema>({
		resolver: yupResolver(formRulesSchema),
	});

	// Mutation quản lý chức năng Register
	const { mutate: registerAccountMutation, isLoading: registerAccountMutationLoadingStatus } = useMutation({
		mutationFn: (body: Omit<FormRulesSchema, "confirm_password">) => registerApi(body),
	});

	// Method quản lý chức năng submit form
	const onsubmit = handleSubmit((data) => {
		const registerData = omit(data, ["confirm_password"]);
		registerAccountMutation(registerData, {
			onSuccess: (data) => {
				setIsLoggedIn(true);
				setUserProfile(data?.data?.data?.user as User);
				const successMessage = data.data.message;
				if (successMessage) {
					toast.success(successMessage, {
						position: "top-center",
						autoClose: 2000,
					});
					navigate("/");
				}
			},
			onError: (error) => {
				if (isAxiosUnprocessableEntityError<ErrorResponseApi<Omit<FormRulesSchema, "confirm_password">>>(error)) {
					const formError = error.response?.data.data; // form = {email: string, password: string}
					if (formError) {
						Object.keys(formError).forEach((property) => {
							setError(property as keyof Omit<FormRulesSchema, "confirm_password">, {
								message: formError[property as keyof Omit<FormRulesSchema, "confirm_password">],
								type: "ServerResponse",
							});
						});
					}
				}
			},
		});
	});

	const { t } = useTranslation("loginRegister");
	const { register: registerPath } = paths;
	const pathname = useLocation().pathname;
	const { changePassword } = paths;

	// state quản lý trạng thái show/hive icon Eye:
	const [openEyeIconMode, setOpenEyeIconMode] = useState<boolean>(false);
	const handleToggleShowPassword: (openEyeIconMode: boolean) => void = (openEyeIconMode: boolean) => {
		setOpenEyeIconMode(openEyeIconMode);
	};
	const inputType = useMemo(() => (openEyeIconMode ? "text" : "password"), [openEyeIconMode]);

	return (
		<div className='bg-orange'>
			<Helmet>
				<title>Đăng ký tài khoản | Shopee clone</title>
				<meta name='description' content='Chức năng đăng ký tài khoản - Dự án Shopee clone' />
			</Helmet>
			<div className='container'>
				<div className='grid grid-cols-5 pr-10 lg:pl-10 py-32 lg:py-12 lowMobile:px-[2px]'>
					<div className='col-start-4 col-span-2 lg:col-start-1 lg:col-span-5 '>
						<form className='p-10 rouned bg-white shadow-sm' onSubmit={onsubmit} noValidate>
							<div className='text-2xl capitalize'>{t("register.register")}</div>
							<Input
								classNameContainer={"mt-3"}
								classNameError={"mt-1 text-red-600 min-h-[1.25rem] text-sm"}
								classNameInput={
									"p-3 w-full outline-none border border-gray-300 focus:border-gray-500 rounded-sm focus:shadow-sm"
								}
								type='email'
								placeholder={t("register.email")}
								register={register}
								formPropertyName='email'
								errorMessage={errors.email?.message}
							/>
							<Input
								classNameContainer={"mt-3"}
								classNameError={"mt-1 text-red-600 min-h-[1.25rem] text-sm"}
								classNameInput={
									"p-3 w-full outline-none border border-gray-300 focus:border-gray-500 rounded-sm focus:shadow-sm"
								}
								autoComplete='on'
								placeholder={t("register.password")}
								register={register}
								formPropertyName='password'
								errorMessage={errors.password?.message}
								handleToggleShowPassword={handleToggleShowPassword as (openEyeIconMode: boolean) => void}
								type={(pathname === registerPath ? inputType : "password") as string}
								pathname={changePassword}
							/>
							<Input
								classNameContainer={"mt-3"}
								classNameError={"mt-1 text-red-600 min-h-[1.25rem] text-sm"}
								classNameInput={
									"p-3 w-full outline-none border border-gray-300 focus:border-gray-500 rounded-sm focus:shadow-sm"
								}
								autoComplete='on'
								placeholder={t("register.confirm password")}
								register={register}
								formPropertyName='confirm_password'
								errorMessage={errors.confirm_password?.message}
								handleToggleShowPassword={handleToggleShowPassword as (openEyeIconMode: boolean) => void}
								type={(pathname === registerPath ? inputType : "password") as string}
								pathname={changePassword}
							/>
							<div className='mt-3'>
								<Button
									className='w-full text-center py-4 px-2 uppercase bg-red-500 text-white text-sm hover:bg-red-600 flex items-center justify-center'
									isLoading={registerAccountMutationLoadingStatus as boolean}
									disabled={registerAccountMutationLoadingStatus as boolean}
								>
									{t("register.submit")}
								</Button>
							</div>
							<div className='flex items-center justify-center mt-8 lowerMobile:flex-col'>
								<span className='text-gray-500 lowerMobile:mb-3'>{t("register.do you already have an account ?")}</span>
								<Link className='text-red-700 ml-1 capitalize' to='/login'>
									{t("register.login")}
								</Link>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}
