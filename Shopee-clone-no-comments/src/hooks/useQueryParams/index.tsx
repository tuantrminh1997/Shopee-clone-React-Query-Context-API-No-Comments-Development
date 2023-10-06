import { useSearchParams } from "react-router-dom";

export default function useQueryParams() {
	// giả sử ta truyền các query params: page =2 và limit = 15 lên url:
	const [urlSearchParams] = useSearchParams();
	// -> biến urlSearchParams gồm: [["page", "2"], ["limit", "15"]]
	// -> Object.fromEntries([...urlSearchParams]) tương đương Object.fromEntries([ ["page", "2"], ["limit", "15"] ])
	// -> Object.fromEntries([ ["page", "2"], ["limit", "15"] ]) trả về { page: 2, limit: 15 }
	return Object.fromEntries([...urlSearchParams]);
	// return Object.fromEntries([
	// 	["page", 2],
	// 	["limit", 15],
	// ]);
}
