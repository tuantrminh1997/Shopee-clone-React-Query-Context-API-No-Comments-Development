// i18n
import { useTranslation } from "react-i18next";
// types
import { RelatedInformationsPropsType } from "src/types";
// private components:
import {
	TopSellingProductListLgResponsive,
	ProductItemDetailInformation,
	SimilarProductList,
	TopSellingProductList,
} from "./components";

export default function RelatedInformations({
	productItemDescription,
	similarProductListQueryData,
	similarSoldByProductListQueryData,
}: RelatedInformationsPropsType) {
	const { t } = useTranslation("productItemDetail");
	return (
		<div className='flex justify-between lg:flex-col w-full'>
			<div className='flex flex-col mt-[15px] basis-[80%] lg:basis-[100%] lg:order-1'>
				<ProductItemDetailInformation
					productItemDescription={productItemDescription as string}
					productDescription={t("related informations.product description")}
					showMoreTitle={t("productInformations.show more")}
					collapseTitle={t("productInformations.collapse")}
				/>
				<TopSellingProductListLgResponsive
					similarSoldByProductListQueryData={similarSoldByProductListQueryData}
					topPicksTitle={t("related informations.top picks from shop")}
				/>
				<SimilarProductList
					similarProductListQueryData={similarProductListQueryData}
					youMayAlsoLikeTitle={t("related informations.you may also like")}
				/>
			</div>
			<TopSellingProductList
				similarSoldByProductListQueryData={similarSoldByProductListQueryData}
				topPicksTitle={t("related informations.top picks from shop")}
			/>
		</div>
	);
}
