// react query/ tanstack query
import { useQuery } from "@tanstack/react-query";
// Sử dụng {Helmet} từ react helmet async thay vì { Helmet } từ react-helmet -> handle vấn đề báo lỗi ở console Using UNSAFE_componentWillMount ...v...v.....
import { Helmet } from "react-helmet-async";
// types
import { QueryConfigType, ProductItemSuccessResponse, Category } from "src/types";
// apis:
import { getProductListApi, getCategoriesApi } from "src/apis";
// custome hooks
import { useQueryConfig } from "src/hooks";
// common components:
import { ProductItem } from "src/components";
// private components:
import { SkeletonLoadingProductItem, Pagination, Sort, AsideFilter } from "./components";

export default function ProductList() {
	// Khi ta chủ động truyền query params trực tiếp lên url -> biến productListQueryParams thay đổi giá trị
	// -> vì biến productListQueryParams là 1 dependency của
	// hook useQuery -> Component bị re-render và khởi tạo 1 query mới -> 1 truy vấn mới đưỢc tạo ra và hàm queryFn đưỢc gọi.
	// const productListQueryParams: QueryConfigType = useQueryParams();

	// biến productListQueryParams -> đỡ lấy toàn bộ giá trị query params và lưu vào 1 object
	// Lưu ý: ở đây có thể có 1 cách khác -> lấy giá trị của biến productListQueryParams làm dependency của useEffect, mỗi khi dependency productListQueryParams thay
	// đổi giá trị -> set lại giá trị cho object queryConfig -> làm như thế không sai nhưng bị thừa, vì ta quan niệm: khi có 1 biến có giá trị phụ thuộc vào giá trị
	// 1 biến khác, ta hoàn toàn có thể tạo ra 1 biến và suy ra thay vì tạo ra hẳn 1 state mới để quản lý biến đó (biến queryConfig phụ thuộc vào giá trị của biến
	// productListQueryParams, biến productListQueryParams lại là dependency của useQuerry rồi nên ko cần cho nó thành dependency của useEffect nữa !)
	// -> tiếp tục lấy giá trị query params trong object productListQueryParams và lưu vào biến query config, có type QueryConfigType

	// Lưu ý ta cần khai báo kiểu QueryConfigType như sau:
	// type QueryConfigType = {
	//   page?: string;
	//   limit?: string;
	//   order?: string;
	//   sort_by?: string;
	//   category?: string;
	//   exclude?: string;
	//   rating_filter?: string;
	//   price_max?: string;
	//   price_min?: string;
	//   name?: string;
	// };
	// -> cấu trúc giống hệt interface ProductListQueryParams
	// -> ta khai báo theo kiểu lấy hết các thuộc tính của inteface ProductListQueryParams nhưng tuy nhiên thay hết = string (vì giá trị lấy ra từ url và lưu vào
	// object productListQueryParams đều là string)

	// const queryConfig: QueryConfigType = omitBy(
	// 	{
	// 		// lấy ra các giá trị query params trong object productListQueryParams
	// 		page: productListQueryParams.page || "1",
	// 		limit: productListQueryParams.limit,
	// 		order: productListQueryParams.order,
	// 		sort_by: productListQueryParams.sort_by,
	// 		category: productListQueryParams.category, // cụ thể là lấy categoryId
	// 		exclude: productListQueryParams.exclude,
	// 		rating_filter: productListQueryParams.rating_filter,
	// 		price_max: productListQueryParams.price_max,
	// 		price_min: productListQueryParams.price_min,
	// 		name: productListQueryParams.name,
	// 		// chú ý: type QueryConfigType có phần lớn thuộc tính ?, nên có thể bị undefined -> ta muốn loại bớt các thuộc tính có giá trị  = undefined trong object
	// 		// queryConfig -> dùng omitBy và isUndefined từ thư viện lodash.
	// 	},
	// 	isUndefined,
	// );

	// Handle chức năng Tìm kiếm sản phẩm:
	// -> tại page ProductList -> filter, lọc priceMax+priceMin/ lọc category
	// -> truyền lên url các query params: rating_filter, price_max, price_min, category
	// -> khi thực hiện nhập từ khóa vào thanh tìm kiếm: ví dụ: Áo nam -> bắn khối query params lên url và xóa đi 1 vài query params
	// - Bước 1: tạo 1 custome hook riêng: useQueryConfig.
	// -> trả về object queryConfig chứa các thuộc tính và giá trị là các query params thu được từ productListQueryParams.
	// -> phân tích lý do vì sao ta chọn cách triển khai bằng custome hook:
	// Thanh tìm kiếm sản phẩm nằm trong Component Header
	// Component ProductList cũng cần các query params và nằm riêng biệt so với component Header
	// -> chọn cách tạo ra 1 custome hook useQueryConfig -> cả 2 Component đều có thể gọi vào và lấy được.
	const queryConfig = useQueryConfig();
	// -> tại component Header dùng tương tự custome hook useQueryConfig() -> thu được object queryConfig chứa các cặp key/value là các
	// query params

	// query quản lý chức năng get ProductList
	const { data: productListQueryData, isLoading: productListLoadingStatus } = useQuery({
		//  "productList" - tên của khối dữ liệu được lưu trong cache của React Query.
		//  productListQueryParams - dependency của useQuery, khi giá trị này thay đổi, useQuery sẽ tự động thực hiện lại truy vấn và cập nhật dữ liệu mới.
		// -> Khi component được mounted hoặc re-render, useQuery sẽ kiểm tra giá trị của queryKey và các dependency khác, nếu có bất kỳ sự thay đổi nào trong chúng, nó sẽ khởi
		// tạo một query mới và gọi lại callback của queryFn để lấy dữ liệu mới từ server. Nếu không có sự thay đổi, nó sẽ sử dụng dữ liệu đã lưu trong cache để tránh gọi
		// lại server.
		queryKey: ["productList", queryConfig],
		queryFn: () => getProductListApi(queryConfig),
		// Giữ lại data cũ trên UI trước khi Data mới được trả về và đổ ra UI
		keepPreviousData: true,
		// -> ta set chung stale Time ở 2 chỗ = 3 phút  = 3 x 60 x 1000
		staleTime: 3 * 60 * 1000,
	});

	// query quản lý chức năng get Categories:
	const { data: categoriesQueryData } = useQuery({
		queryKey: ["categories"],
		queryFn: () => getCategoriesApi(),
	});

	return (
		<div className={`flex w-[1200px] ${!productListQueryData ? "min-h-1000px" : ""}`}>
			<Helmet>
				<title>Trang chủ | Shopee clone</title>
				<meta name='description' content='Trang chủ - Dự án Shopee clone' />
			</Helmet>
			<AsideFilter categoriesData={categoriesQueryData?.data.data as Category[]} queryConfig={queryConfig} />
			<div className={`flex flex-col justify-start ${!productListQueryData ? "h-full" : ""}`}>
				{productListLoadingStatus && (
					<div className='flex flex-wrap mt-2 w-[1000px] min-h-[800px] pb-10'>
						{Array(Number(queryConfig.limit))
							.fill(undefined)
							.map((_, index) => (
								<SkeletonLoadingProductItem key={index} />
							))}
					</div>
				)}
				{!productListQueryData && (
					<div className='flex flex-wrap mt-2 w-[1000px] min-h-[800px] pb-10'>
						{Array(Number(queryConfig.limit))
							.fill(undefined)
							.map((_, index) => (
								<SkeletonLoadingProductItem key={index} />
							))}
					</div>
				)}
				{productListQueryData && !productListLoadingStatus && (
					<>
						<Sort
							queryConfig={queryConfig}
							totalPage={productListQueryData.data.data.pagination.page_size as number}
							categoriesData={categoriesQueryData?.data.data as Category[]}
						/>
						<div className='grid grid-cols-5 gap-2 xl:grid-cols-4 lg:grid-cols-2 sm:grid-cols-1 mt-2 pb-10 lowMobile:grid-cols-2'>
							{productListQueryData.data.data.products.map((product) => (
								<ProductItem key={product._id as string} product={product as ProductItemSuccessResponse} />
							))}
						</div>
						<Pagination
							queryConfig={queryConfig as QueryConfigType}
							totalPage={productListQueryData.data.data.pagination.page_size as number}
						/>
					</>
				)}
			</div>
		</div>
	);
}
// -> chi tiết tuần tự luồng chạy của đoạn code trong component ProductList khi productListQueryParams thay đổi:
// 1. Ban đầu, component ProductList được tạo ra và hiển thị trên giao diện. Tại thời điểm này, biến productListQueryParams đã được khởi tạo từ custom hook
// useProductListQueryParams.
// 2. Khi productListQueryParams thay đổi (ví dụ: khi bạn truyền query params mới lên URL), React sẽ tự động re-render lại component ProductList với giá trị
// productListQueryParams mới.
// 3. Trong quá trình re-render, hook useQuery được gọi lại. Nó sẽ kiểm tra xem các dependencies đã thay đổi hay chưa (trong trường hợp này, dependency là
// productListQueryParams). Vì productListQueryParams đã thay đổi, hook useQuery nhận thấy rằng có sự thay đổi trong dependencies và tiến hành thực hiện lại các bước bên
// trong.
// 4. Hook useQuery gọi hàm queryFn mà bạn đã cung cấp. Trong trường hợp này, queryFn là getProductListApi(productListQueryParams).
// 5. Hàm getProductListApi được gọi với productListQueryParams mới. Điều này có nghĩa là bạn đang yêu cầu lấy dữ liệu sản phẩm mới từ server dựa trên các query params
// mới.
// 6. Sau khi nhận được dữ liệu từ server, hook useQuery sẽ cập nhật data với dữ liệu mới.
// 7. Component ProductList lại được re-render, lần này với dữ liệu mới từ server. Khi component được re-render, nó sẽ hiển thị danh sách sản phẩm dựa trên dữ liệu mới.
// -> Tóm lại, quá trình thay đổi productListQueryParams dẫn đến việc re-render của component ProductList, kích hoạt lại việc gọi API thông qua useQuery, và sau đó hiển
// thị dữ liệu mới lấy được từ server lên giao diện.

// - Ta sẽ truyền toàn bộ khối object queryConfig vào component Pagination thay vì truyền riêng lẻ từng giá trị, mục đích là để trong tương lai, query params có
// nhiều giá trị cùng 1 lúc, giả sử ta thay đổi chỉ 1 giá trị trong nhóm giá trị đó thì chỉ có duy nhất giá trị đó bị cập nhật lại -> các giá trị khác không đổi.

// Lưu ý: API ta đang sử dụng hỗ trợ Pagination gồm:
// pagination: { limit: 30, page: 1, page_size:2 }
