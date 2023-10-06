// react hooks
import { useMemo, useContext } from "react";
// tanstack query:
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// react-hook-form:
import { useForm } from "react-hook-form";
// yup:
import { yupResolver } from "@hookform/resolvers/yup";
// react-router-dom:
import { createSearchParams, useNavigate } from "react-router-dom";
// lodash:
// Chú ý: do thư viện lodash không có tính năng tree-shaking, đó là khi ta cài đặt thư viện vào dependency, import vào componant -> mặc định lodash sẽ import toàn bộ cả
// bộ thư viện lodash vào, -> gây ra tăng dung lượng file Production 1 cách không cần thiết khi build ra.
// -> fix bằng cách import kiểu này:
import omit from "lodash/omit";
// app context
import { AppContext } from "src/contexts/app";
// apis:
import { logoutApi, getPurchaseListApi } from "src/apis";
// custome hooks:
import { useQueryConfig } from "src/hooks";
// types:
import { ProductListSearchFormType, HeaderPropsType } from "src/types";
// schemas:
import { productListSearchSchema } from "src/utils";
// constants:
import { paths, purchaseStatus } from "src/constants";
// private components:
import { LoginRegisterLanguages, SearchForm, ShopeeHeaderLogo, Cart } from "./components";

// Trước mắt component Header dùng cho MainLayout -> Layout sau khi đăng nhập thành công
export default function Header({ isHeaderForCartLayout = false }: HeaderPropsType) {
	// React Context -> App Context
	// isLoggedIn = Context API quản lý trạng thái đăng nhập: có accessToken lưu trong LocalStorage hay không ?
	// userProfile được lấy từ Local Storage (lưu vào Local Storage nhờ Interceptor - Axios)
	const { setIsLoggedIn, isLoggedIn, setUserProfile, userProfile } = useContext(AppContext);
	// constants:
	const { inCart } = purchaseStatus;
	const navigate = useNavigate();
	// query client from tanstack query:
	const queryClient = useQueryClient();

	// react-hook-form cho Product Search Form:
	// type ProductListSearchFormType có cấu trúc kế thừa schema productListSearchSchema {productListSearchForm: string}
	// type ProductListSearchFormType khai báo type cho data của form khi submit thành công
	// type ProductListSearchFormType khai báo type cho object defaultValues luôn !
	const {
		reset: resetForm,
		register,
		handleSubmit,
	} = useForm<ProductListSearchFormType>({
		defaultValues: {
			productListSearchForm: "",
		},
		// Ta đã khai báo type ProductListSearchFormType kế thừa lại cấu trúc của Schema productListSearchSchema
		// -> để cho các rule trong schema này được ép vào form và phát huy tác dụng
		// -> đặt schema vào resolver: yupResolver()
		resolver: yupResolver(productListSearchSchema),
	});

	// custome hook useQueryConfig -> trả về toàn bộ query Params trên trên thanh url
	// -> lưu vào biến queryConfig
	const queryConfig = useQueryConfig();

	// Mutation quản lý chức năng logout
	const { mutate: logoutMutation } = useMutation({
		// khi logout -> gọi hàm loutout
		mutationFn: () => logoutApi(),
		// logout thành công -> set lại biến isLoggedIn
		onSuccess: () => {
			setIsLoggedIn(false);
			setUserProfile(null);
			// Sau khi đăng xuất -> clear dữ liệu PurchaseList trong cached:
			// - khi bạn gọi queryClient.removeQueries({ queryKey: ["purchaseList", { status: inCart }] }) sau khi logout, nhiệm vụ của nó là xoá hoàn toàn dữ liệu purchaseList có
			// trạng thái inCart khỏi bộ nhớ cache của React Query. Tức là dữ liệu sẽ bị xoá khỏi cache và không còn tồn tại trong bộ nhớ cached sau khi bạn logout.
			// - Khi bạn login trở lại, việc gọi query để lấy dữ liệu purchaseList với trạng thái inCart sẽ không lấy dữ liệu từ cache mà sẽ phải gọi lại API để lấy dữ liệu mới.
			// Điều này có nghĩa rằng dữ liệu cũ đã bị xoá hoàn toàn khỏi cache và bạn sẽ lấy dữ liệu mới từ server khi bạn login lại.
			// -> Như vậy, việc xoá dữ liệu cache khi logout và gọi lại API để lấy dữ liệu mới khi login lại là một cách xử lý phù hợp để đảm bảo rằng dữ liệu hiển thị cho người
			// dùng là chính xác và không còn lưu trữ dữ liệu cũ sau khi người dùng logout.
			queryClient.removeQueries({ queryKey: ["purchaseList", { status: inCart }] });
		},
	});

	// method quản lý chức năng Logout:
	const handleLogout = () => {
		logoutMutation();
	};

	// method quản lý chức năng submit form:
	const handleSubmitForm = handleSubmit((dataFormSuccess) => {
		// Chạy vào callback này khi success form thành công
		// -> đồng nghĩa với việc chỉ chạy vào callback này khi object errors trong formState(errors) trống rỗng.
		// -> submit form thành công
		// -> Bắn các giá trị nhập vào form lên thanh Url.
		// -> Sử dụng navigate = useNavigate()(react-router-dom)
		const productName = dataFormSuccess.productListSearchForm;
		// Nếu như có giá trị order trên url -> omit đi sort_by = price và order = asc/desc
		// Còn không thì giữ nguyên
		const config = queryConfig.order
			? omit(
					{
						...queryConfig,
						// ghi đè thuộc tính name:
						name: productName,
					},
					// Các trường thuộc tính bị xóa bỏ khi thực hiện Search tên sản phẩm
					// Chú ý: API không hỗ trợ search ký tự không dấu, cần phải search ký tự đầy đủ dấu, không cần uppercase
					["order", "sort_by"],
			  )
			: {
					...queryConfig,
					// ghi đè thuộc tính name:
					name: productName,
			  };
		navigate({
			pathname: paths.defaultPath,
			search: createSearchParams(config).toString(),
		});
		resetForm();
	});

	// Query quản lý tác vụ callAPI get purchase List -> nhận dữ liệu Các sản phẩm đang có trong cart -> truyền vào Component Cart -> đổ ra UI
	// -> Query không bị gọi lại khi chuyển Page có cùng layout là MainLayout, do MainLayout khi đó chỉ bị re-render
	// -> query này không bị inactive (query bị inactive khi component chứa nó bị unmunted hàon toàn -> khi đó query bắt đầu bị tính thời gian kể từ khi bị xoá)
	// -> không cần thiết phải set staleTime là infinity (vô hạn)
	// Chú ý: Khi component chứa query bị unmounted, thì React Query sẽ ngừng tính thời gian "stale" cho query đó. Nghĩa là nếu bạn mounted lại component và query đó được gọi lại, thời
	// gian "stale" sẽ tính lại từ đầu, không tính tiếp từ thời điểm trước đó khi component bị unmounted.
	const { data: purchaseListQueryData } = useQuery({
		queryKey: ["purchaseList", { status: inCart }],
		// Chú ý: sẽ phát sinh vấn đề khi thêm 1 sản phẩm vào giỏ hàng -> dữ liệu thêm mới trong giỏ hàng chưa được cập nhật và đổ ra UI
		// -> nguyên nhân: do khi kích hoạt sự kiện onClick -> thêm vào giỏ hàng -> call API -> cập nhật mới dữ liệu giỏ hàng trên Server và success
		queryFn: () => getPurchaseListApi({ status: inCart }),
		// Sau khi logout vaf reload lại page -> component header được mounted lại và gọi API getPurchaseListApi, tuy nhiên do đã logout và không còn token trong localStorage
		// -> cuộc gọi API bị lỗi
		// -> fix các vấn đề:
		// 1. sau khi đã logout thì không còn sản phẩm nào trong giỏ hàng.
		// 2. đồng thời không call API getPurchaseListApi -> handle bằng cách sử dụng context isLoggedIn -> enabled khi isLoggedIn = truthy
		enabled: isLoggedIn,
	});
	const purchaseList = useMemo(() => purchaseListQueryData?.data.data, [purchaseListQueryData]);

	return (
		<div
			className={`text-white w-full flex h-[119px] ${
				isHeaderForCartLayout
					? "bg-white border-b border-[rgba(0,0,0,.09)]"
					: "bg-[linear-gradient(-180deg,#f53d2d,#f63)] z-[999] lg:sticky lg:top-0 lg:right-0 lg:left-0"
			}`}
		>
			<div
				className={`flex flex-col justify-start w-[1200px] h-full m-auto ${
					isHeaderForCartLayout ? "flex justify-center" : ""
				} xl:w-full`}
			>
				{!isHeaderForCartLayout && (
					<LoginRegisterLanguages isLoggedIn={isLoggedIn} userProfile={userProfile} handleLogout={handleLogout} />
				)}
				<div
					className={`flex items-center justify-between flex-1 ${
						isHeaderForCartLayout ? "w-[1200px] xl:grid xl:grid-cols-1 xl:w-[100%] xl:justify-center" : ""
					}`}
				>
					{/* Logo Shopee -> tái sử dụng Component PopoverOption do có cấu trúc giống */}
					<ShopeeHeaderLogo isHeaderForCartLayout={isHeaderForCartLayout} />
					{/* 
          - Chức năng tìm kiếm tên sản phẩm -> sử dụng React Hook Form -> useForm, src/utils/schemas/ProductListSearchSchema
          */}
					<SearchForm
						isHeaderForCartLayout={isHeaderForCartLayout}
						handleSubmitForm={handleSubmitForm}
						register={register}
					/>
					{!isHeaderForCartLayout && <Cart purchaseList={purchaseList} isLoggedIn={isLoggedIn} />}
				</div>
			</div>
		</div>
	);
}
