/**
 * Response.data trả về từ server của chức năng Register khi success có cấu trúc:
 * {
    "message": "Đăng ký thành công",
    "data": {
        "access_token": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzMTIxMjEyMTJlcjJAZ21haWwuY29tIiwiaWQiOiI2NGRjNTBhZDNiZTU3NmRkNTNkMmFiNWYiLCJyb2xlcyI6WyJVc2VyIl0sImNyZWF0ZWRfYXQiOiIyMDIzLTA4LTE2VDA0OjI5OjMzLjQ5N1oiLCJpYXQiOjE2OTIxNjAxNzMsImV4cCI6MTY5Mjc2NDk3M30.KjSB_L6ztZm7CzhvbmgI5z_wZaVptFuI7XpWBgIq5xk",
        "expires": 604800,
        "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzMTIxMjEyMTJlcjJAZ21haWwuY29tIiwiaWQiOiI2NGRjNTBhZDNiZTU3NmRkNTNkMmFiNWYiLCJyb2xlcyI6WyJVc2VyIl0sImNyZWF0ZWRfYXQiOiIyMDIzLTA4LTE2VDA0OjI5OjMzLjQ5N1oiLCJpYXQiOjE2OTIxNjAxNzMsImV4cCI6MTcwMDgwMDE3M30.XF9lJLPod5nogsDRoC8Neb0zB1g7Kp2kyDdElQa2RqQ",
        "expires_refresh_token": 8640000,
        "user": {
            "roles": [
                "User"
            ],
            "_id": "64dc50ad3be576dd53d2ab5f",
            "email": "us12121212er2@gmail.com",
            "createdAt": "2023-08-16T04:29:33.481Z",
            "updatedAt": "2023-08-16T04:29:33.481Z",
            "__v": 0
          }
      }
    }
 */

// dấu chấm hỏi ? option chaining ở đây -> bao quát cả 2 trường hợp response success và response error.

interface SuccessResponseApi<DataGenericParameter> {
	message: string;
	data: DataGenericParameter;
}
/**
 * Tại types/authentication ta khai báo: 1 type Authentication và truyền đối số cho generic parameter, chính là type cho khối data nằm trong
 * response của chức năng Register -> sang type AuthenticationResponse tại types/authentication
 */
export default SuccessResponseApi;
