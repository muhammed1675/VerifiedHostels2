import { useState, useEffect, useCallback } from 'react';
import { supabase, getCurrentUser } from '@/lib/supabase';

interface UseTokenBalanceReturn {
  tokenBalance: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useTokenBalance = (): UseTokenBalanceReturn => {
  const [tokenBalance, setTokenBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTokenBalance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const user = await getCurrentUser();

      if (!user) {
        setTokenBalance(0);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('user_tokens')
        .select('token_balance')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          const { error: insertError } = await supabase
            .from('user_tokens')
            .insert({ user_id: user.id, token_balance: 0 } as any);

          if (insertError) throw insertError;
          setTokenBalance(0);
        } else {
          throw fetchError;
        }
      } else {
        setTokenBalance((data as { token_balance: number })?.token_balance || 0);
      }
    } catch (err) {
      console.error('Error fetching token balance:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch token balance');
      setTokenBalance(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTokenBalance();

    let subscription: ReturnType<typeof supabase.channel> | null = null;

    const setupSubscription = async () => {
      const user = await getCurrentUser();
      if (user) {
        subscription = supabase
          .channel('token-balance-changes')
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'user_tokens',
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              setTokenBalance((payload.new as { token_balance: number }).token_balance);
            }
          )
          .subscribe();
      }
    };

    setupSubscription();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [fetchTokenBalance]);

  return {
    tokenBalance,
    loading,
    error,
    refetch: fetchTokenBalance,
  };
};
