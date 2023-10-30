// react query/ tanstack query
import { useQuery } from "@tanstack/react-query";
// react hooks
import { useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
// types
import { Category } from "src/types";
// apis:
import { getProductListApi, getCategoriesApi } from "src/apis";
// custome hooks
import { useQueryConfig } from "src/hooks";
// common components:
import { ProductItem } from "src/components";
// private components:
import { SkeletonLoadingProductItem, Pagination, Sort, AsideFilter } from "./components";
import { createSearchParams, useNavigate } from "react-router-dom";
import { paths } from "src/constants";

export default function ProductList() {
	const queryConfig = useQueryConfig();
	const navigate = useNavigate();

	const { data: productListQueryData, isLoading: productListLoadingStatus } = useQuery({
		queryKey: ["productList", queryConfig],
		queryFn: () => getProductListApi(queryConfig),
		keepPreviousData: true,
		staleTime: 3 * 60 * 1000,
	});

	const totalPage = useMemo(() => productListQueryData?.data.data.pagination.page_size, [productListQueryData]);

	const { data: categoriesQueryData } = useQuery({
		queryKey: ["categories"],
		queryFn: () => getCategoriesApi(),
	});

	const toFirstPage = useMemo(() => Number(queryConfig.page) > (totalPage as number), [queryConfig.page, totalPage]);

	useEffect(() => {
		if (toFirstPage) {
			const newSearchParams = createSearchParams({
				...queryConfig,
				page: "1",
			}).toString();
			navigate(`${paths.defaultPath}?${newSearchParams}`);
		}
	}, [queryConfig, navigate, toFirstPage]);

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
							totalPage={totalPage as number}
							categoriesData={categoriesQueryData?.data.data}
						/>
						<div className='grid grid-cols-5 gap-2 xl:grid-cols-4 lg:grid-cols-2 sm:grid-cols-2 mt-2 pb-10 lowMobile:grid-cols-1'>
							{productListQueryData.data.data.products.map((product) => (
								<ProductItem key={product._id} product={product} />
							))}
						</div>
						<Pagination queryConfig={queryConfig} totalPage={totalPage as number} />
					</>
				)}
			</div>
		</div>
	);
}
