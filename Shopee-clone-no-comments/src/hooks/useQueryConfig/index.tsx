// lodash:
import omitBy from "lodash/omitBy";
import isUndefined from "lodash/isUndefined";
// types
import { QueryConfigType } from "src/types";
// custome hooks
import { useQueryParams } from "src/hooks";

export default function useQueryConfig() {
	// custome hook trả về object queryConfig: chứa các cặp thuộc tính/giá trị là các query params lấy được từ url
	const productListQueryParams: QueryConfigType = useQueryParams();
	// chú ý: type QueryConfigType có phần lớn thuộc tính ?, nên có thể bị undefined -> ta muốn loại bớt các thuộc tính có giá trị  = undefined trong object
	// queryConfig -> dùng omitBy và isUndefined từ thư viện lodash.
	const queryConfig: QueryConfigType = omitBy(
		{
			// lấy ra các giá trị query params trong object productListQueryParams
			page: productListQueryParams.page || "1",
			limit: productListQueryParams.limit || "20",
			order: productListQueryParams.order,
			sort_by: productListQueryParams.sort_by,
			category: productListQueryParams.category, // cụ thể là lấy categoryId
			exclude: productListQueryParams.exclude,
			rating_filter: productListQueryParams.rating_filter,
			price_max: productListQueryParams.price_max,
			price_min: productListQueryParams.price_min,
			// ghi đè vào object queryConfig khi thực hiện chức năng tìm kiếm sản phẩm
			name: productListQueryParams.name,
		},
		isUndefined,
	);
	return queryConfig;
}
