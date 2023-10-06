/* eslint-disable @typescript-eslint/no-explicit-any */

import classNames from "classnames";

import { createSearchParams, useNavigate } from "react-router-dom";

import omit from "lodash/omit";

import { useForm, Controller } from "react-hook-form";

import { yupResolver } from "@hookform/resolvers/yup";

import { CategoryListIcon, FilterIcon, RightArrowIcon } from "src/icons";

import { AsideFilterPropsType, FilterPriceFormData } from "src/types";

import { paths } from "src/constants";

import { filterPriceSchema } from "src/utils";

import { useTranslation } from "react-i18next";

import { Button, InputNumber, RatingStarsFilter } from "src/components";

export default function AsideFilter({ categoriesData, queryConfig }: AsideFilterPropsType) {
	const { t } = useTranslation("productList");

	const { category } = queryConfig;

	const navigate = useNavigate();

	const {
		control,
		handleSubmit,
		reset: resetFilterForm,

		formState: { errors },

		trigger,
	} = useForm<FilterPriceFormData>({
		defaultValues: {
			priceMin: "",
			priceMax: "",
		},

		resolver: yupResolver<FilterPriceFormData>(filterPriceSchema as any),

		shouldFocusError: true,
	});

	const onSubmit = handleSubmit((filterFormData) => {
		navigate({
			pathname: paths.defaultPath,
			search: createSearchParams({
				...queryConfig,
				price_min: filterFormData.priceMin,
				price_max: filterFormData.priceMax,
			}).toString(),
		});
	});

	const handleRemoveAllFilterParams: () => void = () => {
		resetFilterForm(),
			navigate({
				pathname: paths.defaultPath,
				search: createSearchParams(
					omit(
						{
							...queryConfig,
						},
						["category", "price_min", "price_max", "rating_filter"],
					),
				).toString(),
			});
	};

	return (
		<div className='flex flex-col mr-5 mb-5 min-h-[200px] w-48 flex-none lg:hidden'>
			<Button
				childrenClassName={"flex items-center "}
				to={{
					pathname: paths.defaultPath,
					search: createSearchParams(
						omit(
							{
								...queryConfig,
							},
							["category"],
						),
					).toString(),
				}}
				className={classNames(
					"flex border-b border-[rgba(0,0,0,.05)] w-full items-center justify-items-start min-h-[52px] mb-[10px] cursor-pointer",
					{
						"text-[#EE4D2D]": !category,
					},
				)}
			>
				<CategoryListIcon fill={!category ? "#EE4D2D" : "black"} className='mr-[10px]' />
				<span className='text-base font-bold capitalize'>{t("aside filter.all categories")}</span>
			</Button>
			{/* Filter theo Categories */}
			<div className='text-sm'>
				{categoriesData?.map((categoryItem) => {
					const isActive = category === categoryItem._id;
					return (
						<Button
							childrenClassName={"flex items-center "}
							to={{
								pathname: paths.defaultPath,
								search: createSearchParams({
									...queryConfig,
									category: categoryItem._id,
								}).toString(),
							}}
							key={categoryItem._id}
							className={classNames("py-2 pl-3 pr-[10px] cursor-pointer", {
								"text-[#EE4D2D]": isActive,
							})}
						>
							<RightArrowIcon fill={isActive ? "#EE4D2D" : "none"} />
							<span className='ml-2 capitalize'>{categoryItem.name}</span>
						</Button>
					);
				})}
			</div>
			<div className='flex border-b border-[rgba(0,0,0,.05)] w-full items-center justify-items-start min-h-[52px] mb-[10px]'>
				<FilterIcon className='mr-[10px]' />
				<span className='text-base font-bold capitalize'>{t("aside filter.filter search")}</span>
			</div>
			{/* Vùng filter theo khoảng giá */}
			<form className='flex flex-col border-b border-[rgba(0,0,0,.05)] py-5 w-full' onSubmit={onSubmit}>
				<span className='text-sm font-medium mb-[10px] capitalize'>{t("aside filter.price range")}</span>
				<div className='flex justify-between flex-col mt-5 mb-[5px] items-center w-full h-[70px]'>
					<div className='flex items-center justify-between w-full basis-[45%]'>
						<Controller
							control={control}
							name='priceMin'
							render={({ field }) => (
								<InputNumber
									classNameInput={
										"w-20 h-8 bg-[#fff] border border-[rgba(0,0,0,.26)] shadow-slate-600 rounded-sm  pl-1 pr-[2px] py-[2px] text-xs outline-none uppercase"
									}
									type='text'
									placeholder={t("aside filter.min")}
									{...field}
									onChange={(event: any) => {
										field.onChange(event);
										trigger("priceMax");
									}}
								/>
							)}
						/>
						<div className='h-[0.5px] w-3 bg-[#bdbdbd]'></div>
						<Controller
							control={control}
							name='priceMax'
							render={({ field }) => (
								<InputNumber
									classNameInput={
										"w-20 h-8 bg-[#fff] border border-[rgba(0,0,0,.26)] shadow-slate-600 rounded-sm pl-1 pr-[2px] py-[2px] text-xs outline-none uppercase"
									}
									type={"text"}
									placeholder={t("aside filter.max")}
									{...field}
									onChange={(event: any) => {
										field.onChange(event);
										trigger("priceMin");
									}}
								/>
							)}
						/>
					</div>
					<div className='flex justify-between items-center w-full basis-[45%] text-[11px] text-[#EE4D2D]'>
						<span className='text-center'>{errors ? errors.priceMin?.message : ""}</span>
					</div>
				</div>
				<button
					className=' flex justify-center items-center py-[6px] uppercase text-white bg-[#ee4d2d] rounded-sm'
					type='submit'
				>
					{t("aside filter.apply")}
				</button>
			</form>
			{/* Vùng Filer theo Rating Star */}
			<div className='flex flex-col border-b border-[rgba(0,0,0,.05)] py-5 w-full'>
				<span className='text-sm font-medium mb-[10px] capitalize'>{t("aside filter.rating")}</span>
				{/* <RatingStar /> */}
				<RatingStarsFilter t={t("aside filter.up") as string} queryConfig={queryConfig} />
			</div>
			{/* Button Xoá tất cả */}
			<button
				className='mt-[20px] flex justify-center items-center py-[6px] uppercase text-white bg-[#ee4d2d] rounded-sm'
				onClick={handleRemoveAllFilterParams}
			>
				{t("aside filter.clear all")}
			</button>
		</div>
	);
}
