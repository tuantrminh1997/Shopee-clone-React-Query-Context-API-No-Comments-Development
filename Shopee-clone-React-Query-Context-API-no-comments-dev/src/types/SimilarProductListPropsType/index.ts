// axios
import { AxiosResponse } from "axios";
// types
import { ProductListSuccessResponse, SuccessResponseApi } from "src/types";

interface SimilarProductListPropsType {
	similarProductListQueryData: AxiosResponse<SuccessResponseApi<ProductListSuccessResponse>>;
	youMayAlsoLikeTitle: string;
}
export default SimilarProductListPropsType;
