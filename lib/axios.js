import axios from "axios";

// get baseurl
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

// axios instance
const axiosInstance = axios.create({
  baseURL: baseURL, // Use the variable here
  timeout: 10000,
  withCredentials: true, // This is crucial for session-based authentication
});

// interceptor setup
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Promise.reject 대신 Promise.resolve로 가짜 성공 응답을 반환
      return Promise.resolve({
        data: { user: null },
        status: 200,
        statusText: "OK",
      });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
