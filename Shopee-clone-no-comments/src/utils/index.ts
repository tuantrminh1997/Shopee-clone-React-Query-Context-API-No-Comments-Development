export { default as httpInstance } from "./api/httpInstance";

export { default as formRules } from "./rules/formRules";
export { default as getFormRules } from "./rules/getFormRules";

export { default as handleConfirmPasswordSchema } from "./schemas/handleConfirmPasswordSchema";

export { default as formRulesSchema } from "./schemas/formRulesSchema";

export { default as formRulesLoginSchema } from "./schemas/formRulesLoginSchema";

export { default as clearAccessTokenFromLocalStorage } from "./authentication/accessToken/clearAccessTokenFromLocalStorage";
export { default as getAccessTokenFromLocalStorage } from "./authentication/accessToken/getAccessTokenFromLocalStorage";
export { default as saveAccessTokenToLocalStorage } from "./authentication/accessToken/saveAccessTokenToLocalStorage";

export { default as getUserProfileFromLocalStorage } from "./authentication/userProfile/getUserProfileFromLocalStorage";
export { default as saveUserProfileToLocalStorage } from "./authentication/userProfile/saveUserProfileToLocalStorage";
export { default as clearUserProfileFromLocalStorage } from "./authentication/userProfile/clearUserProfileFromLocalStorage";

export { default as formatCurrency } from "./formatCurrencyMethods/formatCurrency";
export { default as formatNumberToSocialStyle } from "./formatCurrencyMethods/formatNumberToSocialStyle";

export { default as filterPriceSchema } from "./schemas/filterPriceSchema";

export type { default as NoUndefinedField } from "./NoUndefinedField";

export { default as removeSpecialCharacter } from "./productItemUrl/removeSpecialCharacter";
export { default as generateNameIdStringUrl } from "./productItemUrl/generateNameIdStringUrl";
export { default as getIdFromNameId } from "./productItemUrl/getIdFromNameId";

export { default as productListSearchSchema } from "./schemas/productListSearchSchema";

export { default as clearLocalStorageEventTarget } from "./eventTargets/clearLocalStorageEventTarget";
export { default as clearAccessTokenUserProfileEvent } from "./eventMessages/clearAccessTokenUserProfileEvent";
export { default as clearAccessTokenUserProfileEventMessage } from "./eventMessages/clearAccessTokenUserProfileEventMessage";

export { default as userProfileSchema } from "./schemas/userProfileSchema";
export { default as userProfilePickedSchema } from "./schemas/userProfilePickedSchema";

export { default as changePasswordPickedSchema } from "./schemas/changePasswordPickedSchema";

export { default as getUserAvatarUrl } from "./userProfile/getUserAvatarUrl";
export { default as getFileExtension } from "./userProfile/getFileExtension";
export { default as getTruthyImageFileExtension } from "./userProfile/getTruthyImageFileExtension";
export { default as getTruthyImageFileSize } from "./userProfile/getTruthyImageFileSize";
export { default as getTruthyImageFileType } from "./userProfile/getTruthyImageFileType";
export { default as getCurrentFileSizeAsMB } from "./userProfile/getCurrentFileSizeAsMB";
export { default as isUserAccountPath } from "./userProfile/isUserAccountPath";

export { default as saveRefreshTokenToLocalStorage } from "./authentication/refreshToken/saveRefreshTokenToLocalStorage";
export { default as clearRefreshTokenFromLocalStorage } from "./authentication/refreshToken/clearRefreshTokenFromLocalStorage";
export { default as getRefreshTokenFromLocalStorage } from "./authentication/refreshToken/getRefreshTokenFromLocalStorage";

export { default as isAxiosErrorTypePredicateMethod } from "./typePredicates/isAxiosErrorTypePredicateMethod";
export { default as isAxiosUnprocessableEntityError } from "./typePredicates/422errors/isAxiosUnprocessableEntityError";
export { default as isAxiosUnauthorizedError } from "./typePredicates/401errors/isAxiosUnauthorizedError";
export { default as isNotUnprocessableEntityError } from "./typePredicates/isNotUnprocessableEntityError";
export { default as isAxiosExpiredTokenError } from "./typePredicates/401errors/isAxiosExpiredTokenError";
