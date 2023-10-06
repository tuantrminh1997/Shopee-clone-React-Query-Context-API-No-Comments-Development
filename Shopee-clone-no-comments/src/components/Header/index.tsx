import { useMemo, useContext } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useForm } from "react-hook-form";

import { yupResolver } from "@hookform/resolvers/yup";

import { createSearchParams, useNavigate } from "react-router-dom";
import omit from "lodash/omit";

import { AppContext } from "src/contexts/app";

import { logoutApi, getPurchaseListApi } from "src/apis";

import { useQueryConfig } from "src/hooks";

import { ProductListSearchFormType, HeaderPropsType } from "src/types";

import { productListSearchSchema } from "src/utils";

import { paths, purchaseStatus } from "src/constants";

import { LoginRegisterLanguages, SearchForm, ShopeeHeaderLogo, Cart } from "./components";

export default function Header({ isHeaderForCartLayout = false }: HeaderPropsType) {
	const { setIsLoggedIn, isLoggedIn, setUserProfile, userProfile } = useContext(AppContext);

	const { inCart } = purchaseStatus;
	const navigate = useNavigate();

	const queryClient = useQueryClient();

	const {
		reset: resetForm,
		register,
		handleSubmit,
	} = useForm<ProductListSearchFormType>({
		defaultValues: {
			productListSearchForm: "",
		},

		resolver: yupResolver(productListSearchSchema),
	});

	const queryConfig = useQueryConfig();

	const { mutate: logoutMutation } = useMutation({
		mutationFn: () => logoutApi(),

		onSuccess: () => {
			setIsLoggedIn(false);
			setUserProfile(null);

			queryClient.removeQueries({ queryKey: ["purchaseList", { status: inCart }] });
		},
	});

	const handleLogout = () => {
		logoutMutation();
	};

	const handleSubmitForm = handleSubmit((dataFormSuccess) => {
		const productName = dataFormSuccess.productListSearchForm;

		const config = queryConfig.order
			? omit(
					{
						...queryConfig,

						name: productName,
					},

					["order", "sort_by"],
			  )
			: {
					...queryConfig,

					name: productName,
			  };
		navigate({
			pathname: paths.defaultPath,
			search: createSearchParams(config).toString(),
		});
		resetForm();
	});

	const { data: purchaseListQueryData } = useQuery({
		queryKey: ["purchaseList", { status: inCart }],

		queryFn: () => getPurchaseListApi({ status: inCart }),

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
					<ShopeeHeaderLogo isHeaderForCartLayout={isHeaderForCartLayout} />
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
