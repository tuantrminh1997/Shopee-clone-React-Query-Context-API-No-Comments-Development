import { loginPathURL } from "src/constants";
// types:
import { RegisterAccountBody, AuthenticationResponse } from "src/types";
// http instance
import { httpInstance as http } from "src/utils";

const loginApi = (body: RegisterAccountBody) => http.post<AuthenticationResponse>(loginPathURL, body);
export default loginApi;
