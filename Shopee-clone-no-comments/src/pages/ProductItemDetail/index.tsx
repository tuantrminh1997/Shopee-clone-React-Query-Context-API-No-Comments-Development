/* eslint-disable @typescript-eslint/no-explicit-any */
// react hooks:
import { useState, useMemo } from "react";
// axios
import { AxiosResponse } from "axios";
// tanstack query
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// react-router-dom
import { useParams, useNavigate } from "react-router-dom";
// Sử dụng {Helmet} từ react helmet async thay vì { Helmet } từ react-helmet -> handle vấn đề báo lỗi ở console Using UNSAFE_componentWillMount ...v...v.....
import { Helmet } from "react-helmet-async";
// react toastify:
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// constants:
import { purchaseStatus, paths } from "src/constants";
// html to text:
import { convert } from "html-to-text";
// apis:
import { getProductItemApi, getProductListApi, addToCartApi } from "src/apis";
// utils:
import { getIdFromNameId } from "src/utils";
// types:
import {
	ProductItemApiType,
	QueryConfigType,
	ProductItemSuccessResponse,
	ProductListSuccessResponse,
	SuccessResponseApi,
} from "src/types";
// private components:
import {
	ProductItemInformation,
	ProductItemImages,
	BreadCrum,
	RelatedInformations,
	SkeletonLoadingProductInformation,
	SkeletonLoadingRelatedInformations,
} from "./components";

export default function ProductItemDetail() {
	// constants:
	const { cart: cartUrl } = paths;
	// navigate
	const navigate = useNavigate();
	// queryClient:
	const queryClient = useQueryClient();
	// constants:
	const { inCart } = purchaseStatus;
	// Mutation quản lý các chức năng về giỏ hàng: addToCartApi -> method Post -> create
	const { mutate: addToCartMutate, mutateAsync: addToCartMutateAsync } = useMutation({
		// Chức năng thêm vào giỏ hàng - add To Cart:
		// -> phương thức Post -> Response trả về là PurchaseItemDetail
		// -> Server add Data của Product Item Detail vào Array Purchase List
		// -> Mỗi Object trong Array Purchase List là 1 PurchaseItemDetail
		// PurchaseItemDetail = khối dữ liệu mới có thuộc tính _id mới, dữ liệu nguyên bản của ProductItemDetail được gói trong thuộc tính
		// product
		mutationFn: (body: ProductItemApiType) => addToCartApi(body),
		// handle vấn đề: khi thêm sản phẩm mới vào giỏ hàng
		// -> dữ liệu trong giỏ hàng chưa được cập nhật mới, cần phải reload lại trang thì mới cập nhật mới.
	});
	// const { itemId1212 } = useParams(); -> undefined, tên tham số phải trùng với tên tham số được quy định trong path render ra
	// element đó
	// Cấu trúc của hàm api thực hiện tác vụ lấy thông tin ProductItem
	//  const getProductItemApi = (productItemId: string) =>
	// 	http.get<SuccessResponseApi<ProductItemSuccessResponse>>(`${pathURL}/${productItemId}`);
	const { itemNameId } = useParams();

	// Dùng function getIdFromNameId ta khai báo tại src/utils -> lấy ra chuỗi Id nằm trong đoạn mã tổng hợp của cả name và id
	const idFromNameId = getIdFromNameId(itemNameId as string);
	// chú ý: handle bug gây ra do ta cố tình thêm ký tự . lên thanh url, đó là lỗi do vitejs gây ra (enter page ProductItem
	// bình thường, nhưng khi reload -> page bị lỗi)
	// -> handle bằng cách rất đơn giản: shopee sử dụng -i. ta thay bằng -i, hoặc -i;

	// Khai báo query thực hiện tác vụ callApi và lưu vào cached khi Component ProductItemDetail được mounted:
	const { data: productItemDetailQueryData } = useQuery({
		// queryKey: tên định danh trong bộ nhớ cached, dependency itemId (khi itemId thay đổi giá trị -> khởi tạo 1 query mới và call Api)
		queryKey: ["productItemInformation", idFromNameId],
		// queryFn chứa callback được gọi mỗi khi React-Query khởi tạo 1 query mới và call API.
		// - Trong thư viện React Query, một query (hoặc query function) sẽ thực hiện việc gọi API để cập nhật dữ liệu mới trong các trường hợp
		// sau:
		// 1. Khởi tạo query ban đầu: Khi bạn khởi tạo một query với useQuery, thư viện sẽ tự động gọi hàm queryFn để lấy dữ liệu ban đầu từ
		// API.
		// 2. Dependency thay đổi: Khi một dependency của query thay đổi, thư viện sẽ tự động gọi lại hàm queryFn để cập nhật dữ liệu mới từ API.
		//  Trong trường hợp của bạn, dependency là itemId, khi itemId thay đổi giá trị, query sẽ được gọi lại để lấy dữ liệu mới từ API dựa
		// trên itemId mới.
		// 3. Kích hoạt query bằng tay: Bạn cũng có thể kích hoạt query bằng tay bằng cách sử dụng các hàm như refetch hoặc invalidateQueries.
		// Khi bạn gọi một trong các hàm này, query sẽ được thực thi lại và gọi API để cập nhật dữ liệu mới.
		// 4. Tự động làm mới (automatic refetching): React Query cung cấp khả năng tự động làm mới dữ liệu dựa trên cấu hình. Bạn có thể thiết
		// lập các options như staleTime để xác định khoảng thời gian tối thiểu giữa các lần làm mới dữ liệu.
		// 5. Thực hiện mutations: Khi bạn thực hiện các mutations (thay đổi dữ liệu) bằng cách sử dụng useMutation, thư viện có thể tự động cập
		// nhật dữ liệu trong cache và làm mới dữ liệu liên quan qua các queries khác.
		// -> Tóm lại, React Query tự động thực hiện gọi API để cập nhật dữ liệu trong những trường hợp nêu trên, giúp bạn duy trì dữ liệu trong
		// cache cùng với việc cập nhật dữ liệu mới một cách hiệu quả.
		queryFn: () => getProductItemApi(idFromNameId as string),
		// -> dữ liệu trả về lưu hết vào biến data
		// -> Data Product Item Detail chứa 1 thuộc tính _id ở bên ngoài.
		// -> sau khi addToCart -> Response trả về xuất hiện 1 thuộc tính _id khác ở lớp ngoài, data nguyên bản của Product Item
		// được gói lại trong thuộc tính product.
	});

	const productItemDetailData: ProductItemSuccessResponse | undefined = useMemo(
		() => productItemDetailQueryData?.data.data,
		[productItemDetailQueryData],
	);

	// Handle chức năng hiển thị các sản phẩm liên quan
	// -> get ProductItem Response API -> trong khối dữ liệu thu được có category._id -> filter theo category._id đó
	// -> navigate của chức năng filter theo category:
	// {{
	//   // Muốn filter theo category -> ghi đè thuộc tính catergory trong object queryConfig bằng category id
	//   // Nhắc lại về nguyên lý hoạt động chỗ này: khi click -> bắn đoạn url có dạng pathname?[Lấy các cặp key/value trong object nhận vào và trả về các cặp
	//   // queryParams và giá trị của chúng.
	//   pathname: paths.defaultPath,
	//   search: createSearchParams({
	//     ...queryConfig,
	//     category: categoryItem._id,
	//   }).toString(),
	// }}

	// Handle chức năng get Item theo CategoryId === Items cùng thể loại
	const productItemCategoryId: string | undefined = useMemo(
		() => productItemDetailQueryData?.data.data.category._id,
		[productItemDetailQueryData],
	);

	// Handle chức năng get Item theo CategoryId === Items cùng thể loại
	const queryConfigOverrideCategory: QueryConfigType = useMemo(
		() => ({ page: "1", limit: "20", category: productItemCategoryId }),
		[productItemCategoryId],
	);

	// Handle chức năng get Item theo CategoryId và bán chạy === Items cùng thể loại
	const queryConfigOverrideCategorySoldBy: QueryConfigType = useMemo(
		() => ({ page: "1", limit: "20", category: productItemCategoryId, sort_by: "sold" }),
		[productItemCategoryId],
	);

	// Querry quản lý chức năng get Items cùng CategoryId
	// -> gọi tới API getProductListApi
	const { data: similarProductListQueryData } = useQuery({
		// Nhắc lại kiến thức về staleTime, query Data:
		// - Một data mà đã `stale` thì khi gọi lại query của data đó, nó sẽ fetch lại api. Nếu không `stale` thì không fetch lại api (đối với trường hợp `staleTime` giữa các
		// lần giống nhau)
		// > Còn đối với trường hợp `staleTime` giữa 2 lần khác nhau thì nếu data của lần query thứ 1 xuất hiện lâu hơn thời gian `staleTime` của lần query thứ 2 thì nó sẽ bị \
		// gọi lại ở lần thứ 2, dù cho có stale hay chưa.
		// > Ví dụ: `useQuery({ queryKey: ['todos'], queryFn: fetchTodos, staleTime: 10*1000 })` xuất hiện 5s trước, bây giờ chúng ta gọi lại `useQuery({ queryKey: ['todos'],
		// queryFn: fetchTodos, staleTime: 2*1000 })` thì rõ ràng cái data của lần 1 dù nó chưa được cho là stale nhưng nó xuất hiện 5s trước và lâu hơn thời gian staleTime là
		// 2s nên nó sẽ bị gọi lại ở lần 2.
		// - Một data mà bị xóa khỏi bộ nhớ (tức là quá thời gian `cacheTime`) thì khi gọi lại query của data đó, nó sẽ fetch lại api. Nếu còn chưa bị xóa khỏi bộ nhớ nhưng đã `stale` thì nó sẽ trả về data cached và fetch api ngầm, sau khi fetch xong nó sẽ update lại data cached và trả về data mới cho bạn.
		// Caching là một vòng đời của:
		// + Query Instance có hoặc không cache data
		// + Fetch ngầm (background fetching)
		// + Các inactive query
		// + Xóa cache khỏi bộ nhớ (Garbage Collection)

		// ta set query key trùng với queryKey của query Get Produtc List Default, đồng thời set stale time cho 2 bên bằng nhau (tại queryKey của ProductList và queryKey
		// của similarProductListQueryData, mục đích để:
		// 1. truy cập vào cùng 1 khối dữ liệu trong bộ nhớ cached.
		// 2. sau khi mounted component ProductList -> truy cập vào khối dữ liệu ProductList, data được get về và bắt đầu tính staleTime
		// -> sau khi ta truy cập vào ProductItem Detail, component RelatedInformations được mounted -> SimilarProductList được mounted -> data của lần get trước có thời gian
		// xuất hiện vẫn < stale time của lần query thứ 2 -> không bị gọi lại API để cập nhật ProductList
		queryKey: ["product_list_same_category", queryConfigOverrideCategory],
		queryFn: () => getProductListApi(queryConfigOverrideCategory),
		// -> ta sẽ thấy fetching API  2 lần, lý do vì khi component được mounted lần 1 -> productItemQueryData được bị undefined -> productItemCategoryId bị undefined
		// -> lần sau productItemCategoryId được cập nhật -> queryConfig được cập nhật -> query được gọi lần 2
		// -> fix bằng cách thêm enabled = Boolean(productItemCategoryId) -> query chỉ được gọi khi productItemCategoryId có data
		staleTime: 3 * 60 * 1000,
		enabled: Boolean(productItemCategoryId),
		// -> ta set chung stale Time ở 2 chỗ = 3 phút  = 3 x 60 x 1000
	});

	// Query quản lý chức năng getItems cùng CategoryId, sold_by = sold (bán chạy)
	const { data: similarSoldByProductListQueryData } = useQuery({
		queryKey: ["product_list_same_category_sold_by_sold", queryConfigOverrideCategorySoldBy],
		queryFn: () => getProductListApi(queryConfigOverrideCategorySoldBy),
		staleTime: 3 * 60 * 1000,
		enabled: Boolean(productItemCategoryId),
	});

	// quản lý số lượng mua tại component này, thông qua state buyCount
	const [numberOfProducts, setNumberOfProducts] = useState<number>(1);
	const handleSetNumberOfProducts: (value: number) => void = (value: number) => {
		setNumberOfProducts(value);
	};

	// Method quản lý chức năng thêm sản phẩm vào giỏ hàng:
	const handleAddToCart = () => {
		// console.log("ProductItemDetailQueryData id: ", ProductItemDetailQueryData?.data.data._id as string); // -> 60afb14d6ef5b902180aacb7
		// console.log("idFromNameId: ", idFromNameId); //                                                         -> 60afb14d6ef5b902180aacb7
		addToCartMutate(
			{
				product_id: productItemDetailQueryData?.data.data._id as string,
				buy_count: numberOfProducts,
			},
			{
				// Cần phải cập nhật lại dữ liệu trong cached, cụ thể là khối dữ liệu quản lý các sản phẩm trong Cart lấy về từ server, lý do là vì:
				// React Query không tự động nhận ra và cập nhật dữ liệu trong cached khi dữ liệu thay đổi. Có một số cách để đảm bảo rằng dữ liệu được cập nhật đúng lúc:
				// 1. Sử dụng staleTime: Bằng cách thiết lập staleTime trong useQuery, bạn có thể chỉ định thời gian sau khi mà dữ liệu sẽ được xem là stale (không còn hợp lệ). Khi thời gian
				// này kết thúc, React Query sẽ thực hiện một request mới để cập nhật dữ liệu.
				// 2. Thông báo cập nhật bằng cách thủ công: Bạn có thể sử dụng hàm queryClient.invalidateQueries để thông báo cho React Query cập nhật dữ liệu một cách thủ công. Điều này
				// đặc biệt hữu ích khi bạn biết rằng dữ liệu đã thay đổi (như trong trường hợp thêm sản phẩm vào giỏ hàng như bạn đã nêu).
				// 3. Khi component được mounted lại: Khi một component bị unmounted và sau đó được mounted lại, React Query sẽ thực hiện một request mới để cập nhật dữ liệu (tùy thuộc vào
				// các điều kiện như staleTime, cacheTime,...). (Đồng thời staleTime sẽ được reset và tính lại từ đầu)
				// -> sử dụng cách 2 để cập nhật lại dữ liệu.
				onSuccess: (addToCartSuccessData) => {
					// response = { message: string , data: PurchaseSuccessResponse }
					toast(addToCartSuccessData.data.message, { autoClose: 3000 });
					queryClient.invalidateQueries({ queryKey: ["purchaseList", { status: inCart }] });
				},
			},
		);
	};

	// Method handle chức năng Mua Ngay
	// -> Bài toán Chia sẻ State giữa 2 Route khác nhau: sử dụng useNavigate tại ProductItemDetail để định nghĩa state
	// -> tại Cart sử dụng useLocation để nhận state đó.
	const handleBuyNow = async () => {
		const response = await addToCartMutateAsync({
			product_id: productItemDetailData?._id as string,
			buy_count: numberOfProducts,
		});
		const purchaseProductItemDetail = response.data.data;
		// - ProductItem = hàng hóa trước khi được add vào giỏ hàng
		// - PurchaseProductItem = Hàng hóa sau khi được add vào giỏ hàng, có thuộc tính _id mới, dữ liệu nguyên bản được đóng gói trong
		// thuộc tính product
		// -> Chia sẻ id của PurchaseItemDetail sang Route Cart
		navigate(cartUrl, {
			state: {
				purchaseProductItemDetailId: purchaseProductItemDetail._id as string,
			},
		});
		// -> tại Route cart nhận state thông qua location = useLocation()
	};

	return (
		<div
			className={`flex flex-col items-center justify-between my-5 w-[1200px] ${
				!productItemDetailData ? "min-h-[1000px]" : ""
			} lg:h-fit xl:w-screen`}
		>
			{productItemDetailData && (
				<Helmet>
					{/* 
          - Đối với các dự án thực tế được quan tâm về SEO -> ta sẽ được cấp 1 description riêng cho chỗ này 
          - ta sử dụng description nằm trong API mô tả sản phẩm luôn, tuy nhiên thì nó đang là 1 read text -> nếu đưa thẳng vào productItemDetailData?.description 
          -> sẽ sinh ra 1 đoạn text lẫn lộn các thẻ p vào nhìn rất xấu -> ta handle bằng cách sử dụng package html to text -> google search html to text npm
          -> yarn add html-to-text
          -> yarn add -D @types/html-to-text
          -> convert 1 chuỗi '<div>Hello World</div>' -> Hello World

          - còn 1 vấn đề đang phát sinh ở console đang báo lỗi do react-helmet gây ra: Using UNSAFE_componentWillMount ...v...v..... 
          -> sử dụng import { Helmet } from "react-helmet-async"
          -> đồng thời cho { HelmetProvider } bao bọc quanh App, ngay bên dưới ReactRouter
        */}
					<title>{productItemDetailData.name as string} | Shopee clone</title>
					<meta
						name='description'
						content={
							`${convert(productItemDetailData.description as string, {
								wordwrap: 120,
							})}` as string
						}
					/>
				</Helmet>
			)}
			{productItemDetailQueryData && (
				<BreadCrum
					productItemName={productItemDetailQueryData.data.data.name as string}
					productItemCategory={productItemDetailQueryData.data.data.category.name as string}
					categoryId={productItemDetailQueryData.data.data.category._id as string}
				/>
			)}

			{!productItemDetailData && !productItemDetailQueryData && <SkeletonLoadingProductInformation />}
			{productItemDetailData && productItemDetailQueryData && (
				<div className='flex justify-between w-full bg-white rounded-sm lg:flex-col'>
					<ProductItemImages
						productItemDetailDatasImage={productItemDetailData.image}
						productItemDetailDatasImages={productItemDetailData.images}
						productItemName={productItemDetailQueryData.data.data.name as string}
					/>
					<ProductItemInformation
						// số lượng sản phẩm
						productItemDetailData={productItemDetailData}
						setNumberOfProducts={setNumberOfProducts}
						handleSetNumberOfProducts={handleSetNumberOfProducts}
						numberOfProducts={numberOfProducts}
						handleAddToCart={handleAddToCart}
						handleBuyNow={handleBuyNow}
						itemNameId={itemNameId as string}
					/>
				</div>
			)}
			{!similarProductListQueryData && <SkeletonLoadingRelatedInformations />}
			{similarProductListQueryData && (
				<RelatedInformations
					similarProductListQueryData={
						similarProductListQueryData as AxiosResponse<SuccessResponseApi<ProductListSuccessResponse>, any>
					}
					productItemDescription={productItemDetailQueryData?.data.data.description as string}
					similarSoldByProductListQueryData={
						similarSoldByProductListQueryData as AxiosResponse<SuccessResponseApi<ProductListSuccessResponse>, any>
					}
				/>
			)}
		</div>
	);
}
