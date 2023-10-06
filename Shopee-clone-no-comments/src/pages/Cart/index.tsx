import { AxiosResponse } from "axios";

import emtyCartBackground from "src/assets/shopee-emty-cart-background.png";

import { useContext, useEffect, useMemo, useCallback } from "react";

import { useTranslation } from "react-i18next";

import { useLocation } from "react-router-dom";

import { useQuery, useMutation } from "@tanstack/react-query";

import { produce } from "immer";

import keyBy from "lodash/keyBy";

import { Helmet } from "react-helmet-async";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AppContext } from "src/contexts/app";

import { getPurchaseListApi, updateCartPurchaseApi, buyCheckedPurchaseItemsApi, deletePurchaseItemApi } from "src/apis";

import {
	BuyProductsApiPropsType,
	ExtendPurchaseSuccessResponse,
	ProductItemApiType,
	PurchaseSuccessResponse,
	SuccessResponseApi,
} from "src/types";

import { purchaseStatus, paths } from "src/constants";

import { TitleArea, SettlementArea } from "./components";

import { PurchaseItem, Button } from "src/components";

export default function Cart() {
	const { extendPurchaseList, setExtendPurchaseList } = useContext(AppContext);

	const { inCart } = purchaseStatus;
	const { productList: productListUrl } = paths;

	const { isLoggedIn } = useContext(AppContext);

	const { data: purchaseListQueryData, refetch: purchaseListQueryRefetch } = useQuery({
		queryKey: ["purchaseList", { status: inCart }],

		queryFn: () => getPurchaseListApi({ status: inCart }),

		enabled: isLoggedIn,
	});

	const purchaseList = useMemo(
		() =>
			(purchaseListQueryData as AxiosResponse<SuccessResponseApi<PurchaseSuccessResponse[]>, any> | undefined)?.data
				.data,
		[purchaseListQueryData],
	);

	const checkedPurchaseItems = useMemo(
		() => extendPurchaseList.filter((purchaseItem) => purchaseItem.isCheck),
		[extendPurchaseList],
	);

	const checkedPurchaseItemsCount = useMemo(() => checkedPurchaseItems.length, [checkedPurchaseItems]);

	const location = useLocation();

	const purchaseProductItemDetailIdFromLocation = useMemo(
		() => location.state?.purchaseProductItemDetailId,
		[location],
	);

	useEffect(() => {
		setExtendPurchaseList((previous) => {
			const extendPurchaseObject = keyBy(previous, "_id");

			return (
				purchaseList?.map((purchaseItem) => {
					const isBuyNowProductItemDetail =
						(purchaseProductItemDetailIdFromLocation as string | null) === (purchaseItem._id as string);
					return {
						...purchaseItem,

						isCheck: isBuyNowProductItemDetail || Boolean(extendPurchaseObject[purchaseItem._id]?.isCheck) || false,
						disabled: false,
					};
				}) || []
			);
		});
	}, [purchaseList, purchaseProductItemDetailIdFromLocation, setExtendPurchaseList]);

	useEffect(() => {
		return () => {
			history.replaceState(null, "");
		};
	}, []);

	const handleCheck: (purchaseItemIndex: number) => (event: React.ChangeEvent<HTMLInputElement>) => void =
		(purchaseItemIndex: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
			setExtendPurchaseList(
				produce((extendPurchaseList) => {
					const onFocusExtendPurchaseItem = extendPurchaseList.find((_, index) => index === purchaseItemIndex);

					(onFocusExtendPurchaseItem as ExtendPurchaseSuccessResponse).isCheck = event.target.checked;
				}),
			);
		};

	const isCheckFull: boolean = useMemo(
		() => extendPurchaseList.every((extendPurchaseItem) => extendPurchaseItem.isCheck),
		[extendPurchaseList],
	);

	const handleCheckFull: () => void = () => {
		setExtendPurchaseList((previous) =>
			previous.map((extendPurchaseItem) => {
				return {
					...extendPurchaseItem,

					isCheck: !isCheckFull,
				};
			}),
		);
	};

	const { mutate: updateCartPurchaseMutation } = useMutation({
		mutationFn: (body: ProductItemApiType) => updateCartPurchaseApi(body),
		onSuccess: () => {
			purchaseListQueryRefetch();
		},
	});

	const { mutate: buyCheckedPurchaseItemsMutation, isLoading: buyCheckedPurchaseItemsIsLoading } = useMutation({
		mutationFn: (body: BuyProductsApiPropsType<ProductItemApiType>) => buyCheckedPurchaseItemsApi(body),
		onSuccess: (buyProductListMutationSuccessData) => {
			purchaseListQueryRefetch();

			const buyProductListMutationSuccessDataMessage = buyProductListMutationSuccessData.data.message;
			toast.success(buyProductListMutationSuccessDataMessage, {
				position: "top-center",
				autoClose: 2000,
			});
		},
	});

	const handleBuyCheckedPurchaseItems: () => void = () => {
		if (checkedPurchaseItemsCount > 0) {
			const checkedPurchaseItemsToServer: BuyProductsApiPropsType<ProductItemApiType> = checkedPurchaseItems.map(
				(checkedPurchaseItem) => ({
					product_id: checkedPurchaseItem.product._id,
					buy_count: checkedPurchaseItem.buy_count,
				}),
			);
			buyCheckedPurchaseItemsMutation(checkedPurchaseItemsToServer);
		}
	};

	const { mutate: deletePurchaseItemMuation } = useMutation({
		mutationFn: (purchaseId: string[]) => deletePurchaseItemApi(purchaseId),
		onSuccess: (deletePurchaseItemSuccessData) => {
			const deletePurchaseItemSuccessDataMessage = deletePurchaseItemSuccessData.data.message;
			toast(deletePurchaseItemSuccessDataMessage, { autoClose: 3000 });
			purchaseListQueryRefetch();
		},
	});

	const handleUpdateQuantityPurchaseItem: (
		purchaseItemIndex: number,
		buyCountValue: number,
		enable: boolean,
	) => void = (purchaseItemIndex: number, buyCountValue: number, enable: boolean) => {
		if (enable) {
			const purchaseItem = extendPurchaseList[purchaseItemIndex];

			setExtendPurchaseList(
				produce((extendPurchaseList) => {
					const onFocusExtendPurchaseItem = extendPurchaseList.find((_, index) => index === purchaseItemIndex);
					(onFocusExtendPurchaseItem as ExtendPurchaseSuccessResponse).disabled = true;
				}),
			);

			updateCartPurchaseMutation({ product_id: purchaseItem.product._id, buy_count: buyCountValue });
		}
	};

	const handleTypeQuantity: (purchaseItemIndex: number) => (value: number) => void =
		(purchaseItemIndex: number) => (value: number) => {
			setExtendPurchaseList(
				produce((extendPurchaseList) => {
					const onFocusExtendPurchaseItem = extendPurchaseList.find((_, index) => index === purchaseItemIndex);
					(onFocusExtendPurchaseItem as ExtendPurchaseSuccessResponse).buy_count = value;
				}),
			);
		};

	const handleDeletePurchaseItem: (purchaseItemIndex: number) => () => void = (purchaseItemIndex: number) => () => {
		const onDeletePurchaseItemId = (
			extendPurchaseList.find(
				(_, extendPurchaseItemIndex) => extendPurchaseItemIndex === purchaseItemIndex,
			) as ExtendPurchaseSuccessResponse
		)._id;
		deletePurchaseItemMuation([onDeletePurchaseItemId]);
	};

	const handleDeletePurchaseItems: () => void = () => {
		const purchaseItemIds = checkedPurchaseItems.map((checkedPurchaseItem) => checkedPurchaseItem._id);
		deletePurchaseItemMuation(purchaseItemIds);
	};

	const getTotalCheckedPurchaseItemsPrice: () => number = useCallback(() => {
		const totalCheckedPurchaseItemsPrice = checkedPurchaseItems.reduce((result, checkedPurchaseItem) => {
			return result + checkedPurchaseItem.buy_count * checkedPurchaseItem.price;
		}, 0);
		return totalCheckedPurchaseItemsPrice;
	}, [checkedPurchaseItems]);

	const getTotalCheckedPurchaseItemsSavingPrice: () => number | null = useCallback(() => {
		const totalCheckedPurchaseItemsPriceBeforeDiscount = checkedPurchaseItems.reduce((result, checkedPurchaseItem) => {
			return (
				(result as number) +
				(checkedPurchaseItem.buy_count as number) * (checkedPurchaseItem.price_before_discount as number)
			);
		}, 0);
		const totalCheckedPurchaseItemsPrice = getTotalCheckedPurchaseItemsPrice;
		const totalCheckedPurchaseItemsSavingPrice =
			totalCheckedPurchaseItemsPriceBeforeDiscount - totalCheckedPurchaseItemsPrice();
		if (totalCheckedPurchaseItemsSavingPrice > 0) {
			return totalCheckedPurchaseItemsSavingPrice;
		}
		return null;
	}, [getTotalCheckedPurchaseItemsPrice, checkedPurchaseItems]);

	const { t } = useTranslation("cart");

	return (
		<div className='flex justify-center bg-[rgba(0,0,0,.09] pt-5 pb-10'>
			<Helmet>
				<title>Quản lý giỏ hàng | Shopee clone</title>
				<meta name='description' content='Chức năng quản lý giỏ hàng - Dự án Shopee clone' />
			</Helmet>
			{extendPurchaseList && extendPurchaseList.length < 1 && (
				<div className='flex w-[1200px]'>
					<div className='m-auto flex flex-col justify-center items-center'>
						<img className='w-[108px] h-[98px]' src={emtyCartBackground} alt='emtyCartBackground' />
						<p className='text-sm text-[#00000066] mt-5'>{t("emtyCart.your shopping cart is emty")}</p>
						<Button
							to={productListUrl}
							childrenClassName={"text-base text-white capitalize"}
							className={"rounded-sm px-[42px] py-[10px] bg-[#ee4d2d] mt-5 hover:bg-[#f05d40]"}
						>
							{t("emtyCart.go shopping now")}
						</Button>
					</div>
				</div>
			)}
			{extendPurchaseList && extendPurchaseList.length > 0 && (
				<div className='flex flex-col w-[1200px] xl:w-screen'>
					<TitleArea isCheckFull={isCheckFull} handleCheckFull={handleCheckFull} />
					{extendPurchaseList.map((extendPurchaseItem, extendPurchaseItemIndex) => {
						const purchaseItemBuyCount = purchaseList?.find((_, index) => index === extendPurchaseItemIndex)?.buy_count;
						return (
							<PurchaseItem
								key={extendPurchaseItemIndex}
								extendPurchaseItem={extendPurchaseItem}
								extendPurchaseItemIndex={extendPurchaseItemIndex}
								purchaseItemBuyCount={purchaseItemBuyCount}
								handleCheck={handleCheck}
								handleUpdateQuantityPurchaseItem={handleUpdateQuantityPurchaseItem}
								handleTypeQuantity={handleTypeQuantity}
								handleDeletePurchaseItem={handleDeletePurchaseItem}
							/>
						);
					})}
					<SettlementArea
						isCheckFull={isCheckFull}
						extendPurchaseList={extendPurchaseList}
						handleCheckFull={handleCheckFull}
						handleDeletePurchaseItems={handleDeletePurchaseItems}
						checkedPurchaseItemsCount={checkedPurchaseItemsCount}
						getTotalCheckedPurchaseItemsPrice={getTotalCheckedPurchaseItemsPrice}
						getTotalCheckedPurchaseItemsSavingPrice={getTotalCheckedPurchaseItemsSavingPrice}
						handleBuyCheckedPurchaseItems={handleBuyCheckedPurchaseItems}
						buyCheckedPurchaseItemsIsLoading={buyCheckedPurchaseItemsIsLoading}
					/>
				</div>
			)}
		</div>
	);
}
