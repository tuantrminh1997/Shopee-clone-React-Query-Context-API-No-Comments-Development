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
		mutationFn: (body: ProductItemApiType) => addToCartApi(body),
	});

	const { itemNameId } = useParams();

	// Dùng function getIdFromNameId ta khai báo tại src/utils -> lấy ra chuỗi Id nằm trong đoạn mã tổng hợp của cả name và id
	const idFromNameId = getIdFromNameId(itemNameId as string);

	// Khai báo query thực hiện tác vụ callApi và lưu vào cached khi Component ProductItemDetail được mounted:
	const { data: productItemDetailQueryData } = useQuery({
		// queryKey: tên định danh trong bộ nhớ cached, dependency itemId (khi itemId thay đổi giá trị -> khởi tạo 1 query mới và call Api)
		queryKey: ["productItemInformation", idFromNameId],
		queryFn: () => getProductItemApi(idFromNameId as string),
	});
	console.log("productItemDetailQueryData: ", productItemDetailQueryData);

	const productItemDetailData: ProductItemSuccessResponse | undefined = useMemo(
		() => productItemDetailQueryData?.data.data,
		[productItemDetailQueryData],
	);

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
		queryKey: ["product_list_same_category", queryConfigOverrideCategory],
		queryFn: () => getProductListApi(queryConfigOverrideCategory),
		staleTime: 3 * 60 * 1000,
		enabled: Boolean(productItemCategoryId),
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
		addToCartMutate(
			{
				product_id: productItemDetailQueryData?.data.data._id as string,
				buy_count: numberOfProducts,
			},
			{
				onSuccess: (addToCartSuccessData) => {
					toast(addToCartSuccessData.data.message, { autoClose: 3000 });
					queryClient.invalidateQueries({ queryKey: ["purchaseList", { status: inCart }] });
				},
			},
		);
	};

	// Method handle chức năng Mua Ngay
	const handleBuyNow = async () => {
		const response = await addToCartMutateAsync({
			product_id: productItemDetailData?._id as string,
			buy_count: numberOfProducts,
		});
		console.log("Purchase Item detail data: ", response);
		const purchaseProductItemDetail = response.data.data;
		navigate(cartUrl, {
			state: {
				purchaseProductItemDetailId: purchaseProductItemDetail._id as string,
			},
		});
	};

	return (
		<div
			className={`flex flex-col items-center justify-between my-5 w-[1200px] ${
				!productItemDetailData ? "min-h-[1000px]" : ""
			} lg:h-fit xl:w-screen`}
		>
			{productItemDetailData && (
				<Helmet>
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
