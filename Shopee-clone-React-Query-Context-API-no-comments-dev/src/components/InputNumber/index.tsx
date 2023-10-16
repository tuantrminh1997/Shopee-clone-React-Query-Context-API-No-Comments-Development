import { forwardRef, useState } from "react";
import { InputNumberPropsType } from "src/types";
import { FieldValues } from "react-hook-form";

// Tham khảo cách rút ngắn code khi sử dụng Component Controller từ react-hook-form -> sử dụng useController từ ReachookForm (Lưu ý là chỉ sử dụng useController khi sử dụng
// react-hook-form)
const InputNumber = forwardRef<HTMLInputElement, InputNumberPropsType<FieldValues>>(function InputNumberInner(
	{
		// className cho thẻ div bao bọc
		classNameContainer, // ?
		// className cho ther input
		classNameInput, // ?
		// className cho thẻ div error
		classNameError, // ?
		type, // ?
		errorMessage, // ?
		placeholder, // ?
		autoComplete, // ?
		onChange, // ?
		value = "",
		...restProps
	},
	ref,
) {
	const [localValueState, setLocalValueState] = useState<string | number>(value);

	// Method handle việc nhập ký tự text -> không ăn, yêu cầu cần nhập chữ số
	const handleChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = event.target;
		if (/^\d+$/.test(value) || value === "") {
			// Nếu có truyền onChange -> truyền event cho onChange và thực thi hàm onChange từ bên ngoài
			onChange && onChange(event);
			// cập nhật lại localValueState -> vì value không truyền từ ngoài vào -> value tại thẻ input = localValueState
			setLocalValueState(value);
		}
	};

	return (
		<div className={classNameContainer}>
			<input
				type={type}
				className={classNameInput}
				placeholder={placeholder}
				autoComplete={autoComplete}
				onChange={handleChangeInput}
				ref={ref}
				value={value === undefined ? localValueState : value}
				{...restProps}
			/>
			<div className={classNameError}>{errorMessage}</div>
		</div>
	);
});
export default InputNumber;
