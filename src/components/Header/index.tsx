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
import { toast } from "react-toastify";

export default function Header({ isHeaderForCartLayout = false }: HeaderPropsType) {
	const { setIsLoggedIn, isLoggedIn, setUserProfile, userProfile } = useContext(AppContext);
	// constants:
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

	// Mutation quản lý chức năng logout
	const { mutate: logoutMutation } = useMutation({
		mutationFn: () => logoutApi(),
		onSuccess: (logoutSuccessData) => {
			setIsLoggedIn(false);
			setUserProfile(null);
			queryClient.removeQueries({ queryKey: ["purchaseList", { status: inCart }] });
			const successMessage = logoutSuccessData.data.message;
			toast.success(successMessage, {
				position: "top-center",
				autoClose: 2000,
			});
		},
	});

	const handleLogout = () => {
		logoutMutation();
	};

	// method quản lý chức năng submit form:
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
