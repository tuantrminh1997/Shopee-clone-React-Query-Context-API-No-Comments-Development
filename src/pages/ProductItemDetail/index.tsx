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
	const { cart: cartUrl } = paths;
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { inCart } = purchaseStatus;
	const { mutate: addToCartMutate, mutateAsync: addToCartMutateAsync } = useMutation({
		mutationFn: (body: ProductItemApiType) => addToCartApi(body),
	});
	const { itemNameId } = useParams();

	const idFromNameId = getIdFromNameId(itemNameId as string);

	const { data: productItemDetailQueryData } = useQuery({
		queryKey: ["productItemInformation", idFromNameId],
		queryFn: () => getProductItemApi(idFromNameId as string),
	});

	const productItemDetailData: ProductItemSuccessResponse | undefined = useMemo(
		() => productItemDetailQueryData?.data.data,
		[productItemDetailQueryData],
	);

	const productItemCategoryId: string | undefined = useMemo(
		() => productItemDetailQueryData?.data.data.category._id,
		[productItemDetailQueryData],
	);

	const queryConfigOverrideCategory: QueryConfigType = useMemo(
		() => ({ page: "1", limit: "20", category: productItemCategoryId }),
		[productItemCategoryId],
	);

	const queryConfigOverrideCategorySoldBy: QueryConfigType = useMemo(
		() => ({ page: "1", limit: "20", category: productItemCategoryId, sort_by: "sold" }),
		[productItemCategoryId],
	);

	const { data: similarProductListQueryData } = useQuery({
		queryKey: ["product_list_same_category", queryConfigOverrideCategory],
		queryFn: () => getProductListApi(queryConfigOverrideCategory),
		staleTime: 3 * 60 * 1000,
		enabled: Boolean(productItemCategoryId),
	});

	const { data: similarSoldByProductListQueryData } = useQuery({
		queryKey: ["product_list_same_category_sold_by_sold", queryConfigOverrideCategorySoldBy],
		queryFn: () => getProductListApi(queryConfigOverrideCategorySoldBy),
		staleTime: 3 * 60 * 1000,
		enabled: Boolean(productItemCategoryId),
	});

	const [numberOfProducts, setNumberOfProducts] = useState<number>(1);
	const handleSetNumberOfProducts: (value: number) => void = (value: number) => {
		setNumberOfProducts(value);
	};

	const handleAddToCart = () => {
		addToCartMutate(
			{
				product_id: productItemDetailQueryData?.data.data._id as string,
				buy_count: numberOfProducts,
			},
			{
				onSuccess: (addToCartSuccessData) => {
					toast.success(addToCartSuccessData.data.message, { position: "top-center", autoClose: 3000 });
					queryClient.invalidateQueries({ queryKey: ["purchaseList", { status: inCart }] });
				},
			},
		);
	};

	const handleBuyNow = async () => {
		const response = await addToCartMutateAsync({
			product_id: productItemDetailData?._id as string,
			buy_count: numberOfProducts,
		});
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
