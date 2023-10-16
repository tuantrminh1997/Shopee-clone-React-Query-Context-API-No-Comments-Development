import * as yup from "yup";

// rule cho form register
const filterPriceSchema = yup.object({
	// nếu chỉ nhập priceMin
	priceMin: yup.string().test({
		name: "Your input price not allowed !",
		message: "Nhập giá không hợp lệ (giá tối đa cần lớn hơn giá tối thiểu, giá tối đa > 0)",
		test(value) {
			const priceMin = value;
			const { priceMax } = this.parent as { priceMin: string; priceMax: string };
			if (priceMin !== "" && priceMax !== "") {
				return Number(priceMax) > Number(priceMin);
			}
			return priceMin !== "" || priceMax !== "";
		},
	}),
	priceMax: yup.string().test({
		name: "Your input price not allowed !",
		message: "Nhập giá không hợp lệ (giá tối đa cần lớn hơn giá tối thiểu)",
		test(value) {
			const priceMax = value;
			const { priceMin } = this.parent as { priceMin: string; priceMax: string };
			// nếu như nhập cả priceMin và priceMax thì: priceMax > priceMin -> return về true
			if (priceMin !== "" && priceMax !== "") {
				return Number(priceMax) > Number(priceMin);
			}
			// không thì nếu chỉ nhập priceMax hoặc priceMin, thì priceMin >= 0 hoặc priceMax > 0
			return priceMin !== "" || (priceMax !== "" && Number(priceMax) > 0);
		},
	}),
});
export default filterPriceSchema;
