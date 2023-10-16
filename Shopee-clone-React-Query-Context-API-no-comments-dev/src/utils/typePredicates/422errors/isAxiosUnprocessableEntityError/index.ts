// axios
import { AxiosError } from "axios";
// type predicate functions:
import { isAxiosErrorTypePredicateMethod } from "src/utils";
// types:
import { HttpStatusCode } from "src/types";

export default function isAxiosUnprocessableEntityError<FormError>(error: unknown): error is AxiosError<FormError> {
	return isAxiosErrorTypePredicateMethod(error) && error.response?.status === HttpStatusCode.UnprocessableEntity;
}