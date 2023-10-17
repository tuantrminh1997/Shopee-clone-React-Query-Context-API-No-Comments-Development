// axios:
import { AxiosResponse } from "axios";
// assets:
import emtyCartBackground from "src/assets/shopee-emty-cart-background.png";
// react hooks:
import { useContext, useEffect, useMemo, useCallback } from "react";
// i18n
import { useTranslation } from "react-i18next";
// react - router - dom:
import { useLocation } from "react-router-dom";
// tanstack query
import { useQuery, useMutation } from "@tanstack/react-query";
// immer:
import { produce } from "immer";
// lodash: chỉ định rõ function keyBy từ lodash để import mỗi function đó, do lodash ko có cơ chế lọc import -> import toàn bộ thư viện lodash vào component khiến cho dung lượng file
// khi build ra bị nặng lên 1 cách không cần thiết.
import keyBy from "lodash/keyBy";
// Sử dụng {Helmet} từ react helmet async thay vì { Helmet } từ react-helmet -> handle vấn đề báo lỗi ở console Using UNSAFE_componentWillMount ...v...v.....
import { Helmet } from "react-helmet-async";
// react toastify:
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// app context
import { AppContext } from "src/contexts/app";
// apis
import { getPurchaseListApi, updateCartPurchaseApi, buyCheckedPurchaseItemsApi, deletePurchaseItemApi } from "src/apis";
// types
import {
	BuyProductsApiPropsType,
	ExtendPurchaseSuccessResponse,
	ProductItemApiType,
	PurchaseSuccessResponse,
	SuccessResponseApi,
} from "src/types";
// constants
import { purchaseStatus, paths } from "src/constants";
// private components:
import { TitleArea, SettlementArea } from "./components";
// common components:
import { PurchaseItem, Button } from "src/components";

export default function Cart() {
	// -> Chuyển lên Context API thay vì quản lý trong nội bộ Component -> lấy về từ Context API để sử dụng.
	const { extendPurchaseList, setExtendPurchaseList } = useContext(AppContext);

	// constants:
	const { inCart } = purchaseStatus;
	const { productList: productListUrl } = paths;
	// isLoggedIn = Context API quản lý trạng thái đăng nhập: có accessToken lưu trong LocalStorage hay không ?
	const { isLoggedIn } = useContext(AppContext);

	// Query fetching API và get purchase list trong giỏ hàng
	const { data: purchaseListQueryData, refetch: purchaseListQueryRefetch } = useQuery({
		queryKey: ["purchaseList", { status: inCart }],
		queryFn: () => getPurchaseListApi({ status: inCart }),
		enabled: isLoggedIn,
	});

	// Khai báo các biến sử dụng trong component Cart
	const purchaseList = useMemo(
		() =>
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(purchaseListQueryData as AxiosResponse<SuccessResponseApi<PurchaseSuccessResponse[]>, any> | undefined)?.data
				.data,
		[purchaseListQueryData],
	);

	// biến đại diện cho toàn bộ Purchase Item đang được check (tối ưu = useMemo do đây là biến)
	const checkedPurchaseItems = useMemo(
		() => extendPurchaseList.filter((purchaseItem) => purchaseItem.isCheck),
		[extendPurchaseList],
	);

	// biến đại diện cho trạng thái check tất cả product item -> đặt gần method handleCheckFull
	const checkedPurchaseItemsCount = useMemo(() => checkedPurchaseItems.length, [checkedPurchaseItems]);

	// Nhận state từ Route ProductItemDetail, _id của PurchaseItemDetail.
	const location = useLocation();

	const purchaseProductItemDetailIdFromLocation = useMemo(
		() => location.state?.purchaseProductItemDetailId,
		[location],
	);

	// extendPurchaseList = danh sách
	useEffect(() => {
		setExtendPurchaseList((previous) => {
			// previous = Array Object hiện tại
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

	// Handle chức năng chọn tất cả:
	const isCheckFull: boolean = useMemo(
		() => extendPurchaseList.every((extendPurchaseItem) => extendPurchaseItem.isCheck),
		[extendPurchaseList],
	);

	// Method quản lý chức năng bật chọn tất cả -> bật thuộc tính isCheck của tất cả các đối tượng.
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

	// Mutation handle chức năng cập nhật Quantity Product Item trong Cart
	const { mutate: updateCartPurchaseMutation } = useMutation({
		mutationFn: (body: ProductItemApiType) => updateCartPurchaseApi(body),
		onSuccess: () => {
			purchaseListQueryRefetch();
		},
	});

	// Mutation handle chức năng Buy Product trong Cart
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

	// Method handle chức năng tiến hành mua/thanh toán các Purchase Item đã được check
	const handleBuyCheckedPurchaseItems: () => void = () => {
		if (checkedPurchaseItemsCount > 0) {
			const checkedPurchaseItemsToServer: BuyProductsApiPropsType<ProductItemApiType> = checkedPurchaseItems.map(
				(checkedPurchaseItem) => ({
					// product_id: checkedPurchaseItem._id -> lỗi -> đọc lại hệ thống để tìm hiểu nguyên nhân
					product_id: checkedPurchaseItem.product._id,
					buy_count: checkedPurchaseItem.buy_count,
				}),
			);
			buyCheckedPurchaseItemsMutation(checkedPurchaseItemsToServer);
		}
	};

	// Mutation handle chức năng Delete Product Item trong Cart
	const { mutate: deletePurchaseItemMutation } = useMutation({
		mutationFn: (purchaseId: string[]) => deletePurchaseItemApi(purchaseId),
		onSuccess: (deletePurchaseItemSuccessData) => {
			const deletePurchaseItemSuccessDataMessage = deletePurchaseItemSuccessData.data.message;
			toast(deletePurchaseItemSuccessDataMessage, { autoClose: 3000 });
			purchaseListQueryRefetch();
		},
	});

	// Method quản lý chức năng cập nhật quantity trong cart:
	const handleUpdateQuantityPurchaseItem: (
		purchaseItemIndex: number,
		buyCountValue: number,
		enable: boolean,
	) => void = (purchaseItemIndex: number, buyCountValue: number, enable: boolean) => {
		if (enable) {
			const purchaseItem = extendPurchaseList[purchaseItemIndex];
			setExtendPurchaseList(
				produce((extendPurchaseList) => {
					// Thay đỔi thuộc tính isCheck của item trong array bằng purchaseItemIndex truyền vào hàm
					const onFocusExtendPurchaseItem = extendPurchaseList.find((_, index) => index === purchaseItemIndex);
					(onFocusExtendPurchaseItem as ExtendPurchaseSuccessResponse).disabled = true;
				}),
			);
			updateCartPurchaseMutation({ product_id: purchaseItem.product._id, buy_count: buyCountValue });
		}
	};

	// method handle chức năng nhập tay quantity:
	const handleTypeQuantity: (purchaseItemIndex: number) => (value: number) => void =
		(purchaseItemIndex: number) => (value: number) => {
			setExtendPurchaseList(
				produce((extendPurchaseList) => {
					// Thay đỔi thuộc tính isCheck của item trong array bằng purchaseItemIndex truyền vào hàm
					const onFocusExtendPurchaseItem = extendPurchaseList.find((_, index) => index === purchaseItemIndex);
					(onFocusExtendPurchaseItem as ExtendPurchaseSuccessResponse).buy_count = value;
				}),
			);
		};

	// Method handle chức năng Delete Product Item trong Cart
	const handleDeletePurchaseItem: (purchaseItemIndex: number) => () => void = (purchaseItemIndex: number) => () => {
		const onDeletePurchaseItemId = (
			extendPurchaseList.find(
				(_, extendPurchaseItemIndex) => extendPurchaseItemIndex === purchaseItemIndex,
			) as ExtendPurchaseSuccessResponse
		)._id;
		deletePurchaseItemMutation([onDeletePurchaseItemId]);
	};

	// Method handle chức năng Delete Product Items trong Cart
	const handleDeletePurchaseItems: () => void = () => {
		// Lọc ra Arrauy các Id từ Array các Purchase Item đang được check sẵn
		const purchaseItemIds = checkedPurchaseItems.map((checkedPurchaseItem) => checkedPurchaseItem._id);
		deletePurchaseItemMutation(purchaseItemIds);
	};

	// Method quản lý chức năng tính tổng số tiền các sản phẩm được check trong giỏ hàng
	// Method quản lý chức năng tính tổng 1 thuộc tính của tất cả các đối tượng trong 1 array -> reduce
	const getTotalCheckedPurchaseItemsPrice: () => number = useCallback(() => {
		const totalCheckedPurchaseItemsPrice = checkedPurchaseItems.reduce((result, checkedPurchaseItem) => {
			return result + checkedPurchaseItem.buy_count * checkedPurchaseItem.price;
		}, 0);
		return totalCheckedPurchaseItemsPrice;
	}, [checkedPurchaseItems]);

	// Method quản lý chức năng tính tổng số tiền tiết kiệm các sản phẩm được check trong giỏ hàng
	// Method quản lý chức năng tính tổng 1 thuộc tính của tất cả các đối tượng trong 1 array -> reduce
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
			{/* Background giỏ hàng trống rỗng */}
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
					{/* Vùng tổng số tiền thanh toán */}
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
