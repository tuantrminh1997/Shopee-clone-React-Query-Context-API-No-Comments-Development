import { AxiosResponse } from "axios";
import { SuccessResponseApi, ProductListSuccessResponse } from "src/types";

interface TopSellingProductListPropsType {
	similarSoldByProductListQueryData: AxiosResponse<SuccessResponseApi<ProductListSuccessResponse>, any>;
	topPicksTitle: string;
}
export default TopSellingProductListPropsType;
