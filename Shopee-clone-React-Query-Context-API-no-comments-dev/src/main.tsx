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
			retry: 0,
		},
	},
});

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
