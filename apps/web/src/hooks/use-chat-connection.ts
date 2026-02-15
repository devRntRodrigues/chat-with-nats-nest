import { useAuth } from "@/contexts/AuthContext";
import { useNats } from "@/contexts/NatsContext";

export interface ChatConnectionStatus {
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
}


const useChatConnection = (): ChatConnectionStatus => {
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();
  const { isConnected, isConnecting, error: natsError } = useNats();

  const isLoading = authIsLoading || (isAuthenticated && isConnecting);
  const isReady = isAuthenticated && isConnected;

  return {
    isLoading,
    isReady,
    error: natsError,
  };
};

export default useChatConnection;
