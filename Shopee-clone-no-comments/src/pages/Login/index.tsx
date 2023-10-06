// libraries
// react hooks:
import { useContext } from "react";
// Sử dụng {Helmet} từ react helmet async thay vì { Helmet } từ react-helmet -> handle vấn đề báo lỗi ở console Using UNSAFE_componentWillMount ...v...v.....
import { Helmet } from "react-helmet-async";
// yup:
import { yupResolver } from "@hookform/resolvers/yup";
// react hook form:
import { useForm } from "react-hook-form";
// react-router-dom
import { Link, useNavigate } from "react-router-dom";
// react query:
import { useMutation } from "@tanstack/react-query";
// i18n
import { useTranslation } from "react-i18next";
// types:
import { FormRulesLogin, FormRulesSchema, ErrorResponseApi, User } from "src/types";
// form rules:
import { isAxiosUnprocessableEntityError, formRulesLoginSchema } from "src/utils";
// apis:
import { loginApi } from "src/apis";
// common components:
import { Input, Button } from "src/components";
// App Context:
import { AppContext } from "src/contexts/app";

export default function Login() {
	// App Context:
	const { setIsLoggedIn, setUserProfile } = useContext(AppContext);
	const navigate = useNavigate();

	const {
		register,
		handleSubmit,
		setError,
		formState: { errors },
		// Cấu trúc object của form login được tạo từ Schema, cấu trúc tương tự object của form login Register
		// nhưng omit đi thuộc tính confirm_password
	} = useForm<FormRulesLogin>({
		resolver: yupResolver<FormRulesLogin>(formRulesLoginSchema),
	});

	// React Query + Apis: Quản lý chức năng call API
	// Mutation quản lý chức năng Register
	const { mutate: loginMutate, isLoading: loginMutateLoadingStatus } = useMutation({
		// loginAPI được gọi và thực hiện tác vụ call API -> interceptor của request được chạy
		mutationFn: (body: Omit<FormRulesSchema, "confirm_password">) => loginApi(body),
	});

	// Method quản lý chức năng submit form
	// handleSubmit: (onValid: SubmitHandler<FormData>, onInvalid?: SubmitErrorHandler<FormData> | undefined)
	const onsubmit = handleSubmit((loginData) => {
		loginMutate(loginData, {
			onSuccess: (data) => {
				// Sau khi login thành công và nhận được response từ server
				// -> cập nhật trạng thái của biến isLoggedIn trong Context
				// Chú ý: trong hook quản lý Route useRouteElements, cần cập nhật lại giá trị của biến isLoggedIn từ Context
				setIsLoggedIn(true);
				// lưu thông tin user vào biến userProfile trong Context API -> triển khai tương tự bên page Register
				setUserProfile(data?.data?.data?.user as User);
				// và navigate sang trang danh sách sản phẩm: Route "/"
				navigate("/");
			},
			onError: (error) => {
				if (isAxiosUnprocessableEntityError<ErrorResponseApi<Omit<FormRulesSchema, "confirm_password">>>(error)) {
					// Bắt lỗi 422 bằng typePredicate
					const formError = error.response?.data.data; // form = {email: string, password: string}
					if (formError) {
						Object.keys(formError).forEach((property) => {
							//  setError được sử dụng để lưu thông tin lỗi vào biến errors trong formState. Khi bạn gọi setError, React Hook Form sẽ cập
							// nhật biến errors với thông tin lỗi mới, từ đó bạn có thể hiển thị lỗi lên giao diện người dùng.
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

	return (
		<div className='bg-orange'>
			<Helmet>
				<title>Đăng nhập | Shopee clone</title>
				<meta name='description' content='Chức năng đăng nhập - Dự án Shopee clone' />
			</Helmet>
			{/* 
        -> ctrl + u sẽ thấy source gốc của trang web thay vì nhìn thấy thẻ tỉtle và thẻ meta tương ứng ở page này.
        -> lý do là vì: sau khi trình duyệt load source gốc của trang web, nó sẽ load tiếp file javascript đi kèm và render theo đúng logic của JS -> thẻ title và thẻ meta ở các page được
        render ra sau.
        -> ta thấy đang có hiện tượng 1 page mà element load đến tận 2 cặp thẻ meta -> fix bằng cách thêm data-react-helmet="true" vào thẻ meta ở index.html
        
      */}
			{/* 
          Ta sẽ custome riêng thuộc tính container trong tailwind, thay vì sử dụng thuộc tính container mặc định trong tailwind
          cách custome: sử dụng plugin trong tailwincss/plugin, xem tại doc: 
      */}
			<div className='container'>
				<div className='grid grid-cols-5 pr-10 lg:pl-10 py-32 lg:py-12 lowMobile:px-[2px]'>
					<div className='col-start-4 col-span-2 lg:col-start-1 lg:col-span-5 '>
						{/* 
              noValidate = ngăn chặn validate theo HTML, sử dụng Validate theo logic JS 
            */}
						<form className='p-10 rouned bg-white shadow-sm' onSubmit={onsubmit} noValidate>
							<div className='text-2xl capitalize'>{t("login.login")}</div>
							{/* 
                - Định nghĩa đúng type cho InputPropsType -> truyền Form Generic Type
              */}
							<Input<FormRulesLogin>
								formPropertyName='email'
								classNameContainer={"mt-3"}
								classNameError={"mt-1 text-red-600 min-h-[1.25rem] text-sm"}
								classNameInput={
									"p-3 w-full outline-none border border-gray-300 focus:border-gray-500 rounded-sm focus:shadow-sm"
								}
								type='email'
								placeholder={t("login.email")}
								register={register}
								// Do ta đặt type register?: UseFormRegister<any> nên ở đây không nhận được gợi ý từ
								// react hook form -> xem chi tiết tại file markdown: Phân tích generic type cho component input ...
								errorMessage={errors.email?.message}
							/>
							<Input<FormRulesLogin>
								formPropertyName='password'
								classNameContainer={"mt-3"}
								classNameError={"mt-1 text-red-600 min-h-[1.25rem] text-sm"}
								classNameInput={
									"p-3 w-full outline-none border border-gray-300 focus:border-gray-500 rounded-sm focus:shadow-sm"
								}
								type='password'
								autoComplete='on'
								placeholder={t("login.password")}
								register={register}
								// Do ta đặt type register?: UseFormRegister<any> nên ở đây không nhận được gợi ý từ
								// react hook form -> xem chi tiết tại file markdown: Phân tích generic type cho component input ...
								errorMessage={errors.password?.message}
							/>
							<div className='mt-3'>
								{/* 
                  Chú ý: khi trong 1 form có button mà ta không định nghĩa thuộc tính type = submit, mặc định button đó có type = submit
                */}
								<Button
									type='submit'
									className='w-full text-center py-4 px-2 uppercase bg-red-500 text-white text-sm hover:bg-red-600 flex items-center justify-center'
									// prop isLoading, disabled được truyền khi mutation đang loading và đợi server trả response về.
									isLoading={loginMutateLoadingStatus}
									disabled={loginMutateLoadingStatus}
								>
									{t("login.login")}
								</Button>
							</div>
							<div className='flex items-center justify-center mt-8 lowerMobile:flex-col'>
								<span className='text-gray-500 lowerMobile:mb-3 capitalize'>{t("login.do not have an account ?")}</span>
								<Link className='text-red-700 ml-1 capitalize' to='/register'>
									{t("login.register")}
								</Link>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}
