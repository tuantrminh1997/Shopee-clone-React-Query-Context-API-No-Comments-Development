import { Fragment } from "react";

import { FieldPath, FieldValues } from "react-hook-form";

import { paths } from "src/constants";

import { EyeHideIcon, EyeShowIcon } from "src/icons";

import { ContainerPropsType, InputNumberPropsType } from "src/types";

export default function Input<TFieldValues extends FieldValues = FieldValues>({
	classNameContainer,
	classNameInput,
	classNameError,
	type,
	errorMessage,
	placeholder,
	formPropertyName,
	register,
	formPropertyRules,
	autoComplete,
	ContainerElement,
	ErrorContainerElement,
	handleToggleShowPassword,
	pathname,
	...restProps
}: InputNumberPropsType<TFieldValues>) {
	const registerResult =
		register && formPropertyName ? register(formPropertyName as FieldPath<TFieldValues>, formPropertyRules) : null;

	const { changePassword } = paths;

	const containerProps: ContainerPropsType = {};
	const errorContainerProps: ContainerPropsType = {};

	if (ContainerElement !== Fragment) {
		containerProps.className = `${classNameContainer} relative`;
	}
	if (ErrorContainerElement !== Fragment) {
		errorContainerProps.className = classNameError;
	}
	const Container = ContainerElement || "div";
	const ErrorContainer = ErrorContainerElement || "div";

	return (
		<Container {...containerProps}>
			<input
				type={type}
				className={classNameInput}
				placeholder={placeholder}
				autoComplete={autoComplete}
				{...registerResult}
				{...restProps}
			/>
			{pathname === changePassword && type === "password" && (
				<span
					className='absolute top-0 right-0 pr-2 cursor-pointer translate-y-[50%]'
					onClick={() => {
						handleToggleShowPassword && handleToggleShowPassword(true);
					}}
					aria-hidden='true'
				>
					<EyeHideIcon />
				</span>
			)}
			{pathname === changePassword && type === "text" && (
				<span
					className='absolute top-0 right-0 pr-2 cursor-pointer translate-y-[50%]'
					onClick={() => {
						handleToggleShowPassword && handleToggleShowPassword(false);
					}}
					aria-hidden='true'
				>
					<EyeShowIcon />
				</span>
			)}
			{/* Nếu không set min-h -> khi xuất hiện lỗi hoặc không -> UI bị đẩy lên đẩy xuống gây xấu. */}
			<ErrorContainer {...errorContainerProps}>{errorMessage}</ErrorContainer>
		</Container>
	);
}
