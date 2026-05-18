import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./shared/hooks/useTheme";
import { AppRoutes } from "./router/AppRoutes";
import { Toaster } from "./shared/components/atoms/sonner";
import { handleApiError } from "./shared/services/errorHandler";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Global error handling for unhandled promise rejections
window.addEventListener("unhandledrejection", (event) => {
  handleApiError(event.reason, { context: "Unhandled Promise Rejection" });
});

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="atomix-ui-theme">
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <AppRoutes />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
