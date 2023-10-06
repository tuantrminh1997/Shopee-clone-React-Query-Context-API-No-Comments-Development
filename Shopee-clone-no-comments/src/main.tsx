import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "src/App";
import { BrowserRouter as Router } from "react-router-dom";
// react query devtool:
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// app provider:
import { AppProvider } from "src/contexts/app";
// error boundary"
import { ErrorBoundary } from "src/components";
// react helmet
import { HelmetProvider } from "react-helmet-async";
// i18n = change languages
import "src/i18n";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			// query cho toàn bộ ứng dụng, số lần retry khi fetch API bị lỗi:
			// - giả sử cố tình sửa access_token thành sai -> thực hiện tác vụ call API (get Product Item List chẳng hạn) -> lỗi và react query
			// tự động retry theo số lần cấu hình ở đây.
			retry: 0,
		},
	},
});

// Chú ý: HelmetProvider để sử dụng { Helmet } from "react-helmet-async", bọc App và ngay bên dưới React Router
ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<Router>
			<HelmetProvider>
				<QueryClientProvider client={queryClient}>
					<AppProvider>
						<ErrorBoundary>
							<App />
						</ErrorBoundary>
					</AppProvider>
					<ReactQueryDevtools initialIsOpen={false} />
				</QueryClientProvider>
			</HelmetProvider>
		</Router>
	</React.StrictMode>,
);

// 04/10/2023 - 7:25AM
