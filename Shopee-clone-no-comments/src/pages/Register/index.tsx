// libraries
// react hooks:
import { useContext } from "react";
// yup:
import { yupResolver } from "@hookform/resolvers/yup";
// react hook form:
import { useForm } from "react-hook-form";
// react-router-dom:
import { Link, useNavigate } from "react-router-dom";
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

	/**
	 * Sử dụng hàm getFormRules return về kiểu FormRules ta đã định nghĩa
	 * -> mục đích để có thể truyền hàm getValues vào, thay vì phải sử dụng spread operator
	 */
	// const formRules = getFormRules(getValues);
	/**
	 * -> Chuyển sang dùng Schema
	 */

	// React Query + Apis: Quản lý chức năng call API
	// Mutation quản lý chức năng Register
	const { mutate: registerAccountMutation, isLoading: registerAccountMutationLoadingStatus } = useMutation({
		mutationFn: (body: Omit<FormRulesSchema, "confirm_password">) => registerApi(body),
	});

	// Method quản lý chức năng submit form
	// handleSubmit: (onValid: SubmitHandler<FormData>, onInvalid?: SubmitErrorHandler<FormData> | undefined)
	const onsubmit = handleSubmit(
		// const {mutate} = registerAccountMutation;
		// callback được truyền vào tham số thứ 1 của handleSubmit được gọi khi form đúng (nhập đầy đủ input, đúng định dạng từng
		// input, ko có errors)
		(data) => {
			/**
			 * Chú ý: đối với tác vụ submit form, gửi data form lên server, nên đặt tên biến kiểu snake_case, vì đã số server sẽ sử dụng tên biến
			 * kiểu snake_case -> ta đặt tên biến trong form data kiểu snake_case luôn cho tiện.
			 */
			// Ngắt thuộc tính confirm_password của data bằng lodash:
			const registerData = omit(data, ["confirm_password"]);
			/**
       * Nếu dữ liệu hợp lệ theo schema validation (do Yup thực hiện), callback trong handleSubmit được gọi với đối số là data, chứa 
       * dữ liệu đã nhập từ form.
        -> Biến registerData được tạo để lưu trữ dữ liệu form (loại bỏ confirm_password).
        -> Hàm mutate của registerAccountMutation được gọi với registerData như là tham số đầu tiên.
       */
			registerAccountMutation(registerData, {
				/**
				 * -> response trả về được lưu vào biến data trong onSuccess
				 * -> callback của onSuccess được gọi.
				 */
				onSuccess: (data) => {
					// Sau khi Register thành công và nhận được response từ server
					// -> cập nhật trạng thái của biến isLoggedIn trong Context
					// Chú ý: trong hook quản lý Route useRouteElements, cần cập nhật lại giá trị của biến isLoggedIn từ Context
					setIsLoggedIn(true);
					setUserProfile(data?.data?.data?.user as User); // -> tiếp tục sau khi logout thành công -> setProfile thành null (sang page Header)
					// và navigate sang trang danh sách sản phẩm: Route "/"
					navigate("/");
				},
				onError: (error) => {
					//
					/**
					 * Type Predicate Custome Function: type AxiosError && error.response.status === 422
					 * Truyền đối số cho generic parameter của type predicate function isAxiosUnprocessableEntityError là:
					 * -> khi có error trả về, error sẽ có dạng như sau:
					 * {data : {email: 'Email đã tồn tại'}, message: "Lỗi"}
					 * -> ResponseApi<Omit<FormRulesSchema, "confirm_password">> trả về dạng {data : {email: string, password: string}, message: tring}
					 * -> khi ta truyền giá trị cho generic parameter như bên dưới: Omit<FormRulesSchema, "confirm_password">> -> {email: ..., password: ...}
					 * -> Tóm lại, khi ta sử dụng type predicate isAxiosUnprocessableEntityError với đối số generic parameter như sau, mục đích là:
					 *  ép kiểu error có type AxiosError, status = 422 và có cấu trúc dạng {data : {email: string, password: string}, message: tring}
					 */
					if (isAxiosUnprocessableEntityError<ErrorResponseApi<Omit<FormRulesSchema, "confirm_password">>>(error)) {
						// lỗi !== lỗi 422 ta đã xử lý ở Interceptor của Axios (trước) bằng cách toast lên bằng Toastify
						// lỗi === 422 -> được bắt và xử lý ở đây
						console.log("Type AxiosUnprocessableEntityError error: ", error);
						/**
						 * -> Sau khi đã ép kiểu type Predicate thành công
						 * -> ta sử dụng tới thuộc tính setError của object trả về từ useForm()
						 * -> ctrl + click chuột -> tự đọc data type của setError trong thư viện
						 * -> setError có type UseFormSetError<TFieldValues>;
						 * -> UseFormSetError là 1 type được gán cho 1 function, nhận 2 tham số name và errors và trả về void
						 * -> errors có type ErrorOption
             * -> ErrorOptions là 1 type gán cho 1 object có thuộc tính
             *     message?: Message;
                  type?: LiteralUnion<keyof RegisterOptions, string>;
                  types?: MultipleFieldErrors;
						 */

						const formError = error.response?.data.data; // form = {email: string, password: string}
						/**
             * thay vì set thủ công:
             * if (formError?.password) {
							  setError("password", {
								message: formError.password,
								type: "ServerResponse"
							});
						}
            -> sủ dụng vòng lặp
             */
						if (formError) {
							Object.keys(formError).forEach((property) => {
								/**
								 * Ở đây sẽ xuất hiện lỗi TypeScript: Argument of type 'string' is not assignable to parameter of type '"email" | "password" | "confirm_password"
								 * -> Lý do lỗi là vì: setError() -> tham số đầu tiên của nó mong muốn nhận vào 1 trong 3 giá trị: "email" | "password" | "confirm_password"
								 * -> trong khi property đang là string, tức là chưa đủ chi tiết
								 * -> ép kiểu cho property: as keyof Omit<FormRulesSchema, "confirm_password">
								 * keyof Omit<FormRulesSchema, "confirm_password"> trả về các thuộc tính trong object FormRulesSchema, chính là:
								 * "email" | "password" | "confirm_password"
								 */
								setError(property as keyof Omit<FormRulesSchema, "confirm_password">, {
									//  setError được sử dụng để lưu thông tin lỗi vào biến errors trong formState. Khi bạn gọi setError, React Hook Form sẽ cập
									// nhật biến errors với thông tin lỗi mới, từ đó bạn có thể hiển thị lỗi lên giao diện người dùng.
									message: formError[property as keyof Omit<FormRulesSchema, "confirm_password">],
									type: "ServerResponse",
								});
								// setError()
							});
						}
					}
					/**
					 * -> Errors Object có property status = 422 -> email đăng ký bị trùng
					 * -> handle bằng cách: sử dụng thuộc tính setError của thư viện React Hook Form, {setError} = useForm();
					 * -> Lỗi !== 422 -> toast lên
					 * -> lỗi === 422 -> show lên UI
					 */
				},
			});
		},
	);

	/**
	 * Chú ý: React Hook Form có kiểu Behavior mặc định như sau:
	 * khi nhập liệu và chưa submit form -> component ko bị re-render
	 * khi thực hiện submit form -> re-render
	 * khi tiếp tục nhập liệu và sinh ra errors -> component bị re-render
	 */

	/**
	 * Handle chức năng confirm password phải trùng với password
	 * cách 1: sử dụng thuộc tính watch trong object trả về của useForm():
	 *    const password = watch("password")
	 *    -> component bị re-render liên tục khi nhập vào thanh input có {...register("password")}
	 *
	 * cách 2: ở cách 1, việc component bị re-render liên tục khiến ta khó chịu -> sử dụng thuộc tính getValues trong object trả về của useForm()
	 *    sử dụng thuộc tính validate trong object formRules:
   <input
      {...register("test1", {
        validate: {
          positive: v => parseInt(v) > 0 || 'should be greater than 0',
          lessThanTen: v => parseInt(v) < 10 || 'should be lower than 10',
          validateNumber: (_: number, formValues: FormValues) => {
            return formValues.number1 + formValues.number2 === 3 || 'Check sum number';
          },
          // you can do asynchronous validation as well
          checkUrl: async () => await fetch() || 'error message',  // JS only: <p>error message</p> TS only support string
          messages: v => !v && ['test', 'test2']
        }
      })}
    />
    * Đọc code mẫu ví dụ: v = value của thuộc tính "test1" trong form data object
        v -> trả về true 
	 */

	const { t } = useTranslation("loginRegister");
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
							{/* 
                * Chú ý: register("email") sẽ trả về thuộc tính name
                -> cụ thể: ctrl + click chuột register -> để xem chi tiết cách định nghĩa thuộc tính register trong object trả về 
                của useForm().
                -> thuộc tính register có type UseFormRegister<TFieldValues>
                -> type UseFormRegister<TFieldValues> được định nghĩa là 1 function, return về dữ liệu có type
                là UseFormRegisterReturn<TFieldName>;
                -> kiểu UseFormRegister<TFieldValues> được định nghĩa gồm các thuộc tính:
                */
							/**
                 * onChange: ChangeHandler;
                  onBlur: ChangeHandler;
                  ref: RefCallBack;
                  name: TFieldName;
                  min?: string | number;
                  max?: string | number;
                  maxLength?: number;
                  minLength?: number;
                  pattern?: string;
                  required?: boolean;
                  disabled?: boolean;
                */
							/**
                -> register() trả về 1 object có các thuộc tính email, giá trị = value thanh input.
                function register() nhận vào tham số thứ 2 là 1 object, handle việc validate form
                Sử dụng Register with validation and error message, xem thêm tại trang chủ React Hook Form
                pattern email:

                Chú ý: việc validate các rules trực tiếp sẽ gây rườm rà, trường hợp tổng quát khi ta có nhiều rules, sẽ càng rườm
                rà
                -> ý tưởng là khai báo 1 biến để kế thừa các rules lại.
                Định nghĩa type cho formRules, formRules được truyền vào dưới dạng đối số thứ 2 của hàm register -> tra cứu type của tham
                số thứ 2 của hàm register -> ctrl + click chuột
              */}
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
								/**
								 * Sử dụng rule từ schema -> ko cần truyền formRules nữa
								 */
								errorMessage={errors.email?.message}
							/>
							<Input
								classNameContainer={"mt-3"}
								classNameError={"mt-1 text-red-600 min-h-[1.25rem] text-sm"}
								classNameInput={
									"p-3 w-full outline-none border border-gray-300 focus:border-gray-500 rounded-sm focus:shadow-sm"
								}
								type='password'
								autoComplete='on'
								placeholder={t("register.password")}
								register={register}
								formPropertyName='password'
								errorMessage={errors.password?.message}
							/>
							<Input
								classNameContainer={"mt-3"}
								classNameError={"mt-1 text-red-600 min-h-[1.25rem] text-sm"}
								classNameInput={
									"p-3 w-full outline-none border border-gray-300 focus:border-gray-500 rounded-sm focus:shadow-sm"
								}
								type='password'
								autoComplete='on'
								placeholder={t("register.confirm password")}
								register={register}
								formPropertyName='confirm_password'
								errorMessage={errors.confirm_password?.message}
							/>
							<div className='mt-3'>
								<Button
									className='w-full text-center py-4 px-2 uppercase bg-red-500 text-white text-sm hover:bg-red-600 flex items-center justify-center'
									// prop isLoading, disabled được truyền khi mutation đang loading và đợi server trả response về.
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
