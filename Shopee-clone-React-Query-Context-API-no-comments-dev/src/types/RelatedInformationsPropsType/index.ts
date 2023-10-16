import { AxiosResponse } from "axios";
import { ProductListSuccessResponse, SuccessResponseApi } from "src/types";

interface RelatedInformationsPropsType {
	similarProductListQueryData: AxiosResponse<SuccessResponseApi<ProductListSuccessResponse>>;
	productItemDescription: string;
	similarSoldByProductListQueryData: AxiosResponse<SuccessResponseApi<ProductListSuccessResponse>>;
}
export default RelatedInformationsPropsType;
