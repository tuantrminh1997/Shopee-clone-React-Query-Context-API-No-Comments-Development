import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "src/App";
import { BrowserRouter as Router } from "react-router-dom";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClientProvider } from "@tanstack/react-query";
import { AppProvider } from "src/contexts/app";
import { ErrorBoundary } from "src/components";
import { HelmetProvider } from "react-helmet-async";
import "src/i18n";
import queryClient from "src/queryClient";

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
