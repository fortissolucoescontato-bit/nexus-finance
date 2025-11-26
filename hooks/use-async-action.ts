/**
 * Hook customizado para gerenciar estados de ações assíncronas
 * 
 * Simplifica o gerenciamento de loading, error e success states
 * para Server Actions e outras operações assíncronas
 */

import { useState, useCallback } from 'react';

interface UseAsyncActionOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error | string) => void;
}

interface AsyncActionState<T> {
  isLoading: boolean;
  error: string | null;
  data: T | null;
}

/**
 * Hook para gerenciar estados de ações assíncronas
 * 
 * @example
 * const { execute, isLoading, error } = useAsyncAction(async (name: string) => {
 *   return await createOrganization(name);
 * });
 * 
 * await execute('Minha Organização');
 */
export function useAsyncAction<T = unknown, P = void>(
  action: (params: P) => Promise<T>,
  options?: UseAsyncActionOptions<T>
) {
  const [state, setState] = useState<AsyncActionState<T>>({
    isLoading: false,
    error: null,
    data: null,
  });

  const execute = useCallback(
    async (params: P): Promise<T | null> => {
      setState({
        isLoading: true,
        error: null,
        data: null,
      });

      try {
        const result = await action(params);
        
        setState({
          isLoading: false,
          error: null,
          data: result,
        });

        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        
        setState({
          isLoading: false,
          error: errorMessage,
          data: null,
        });

        options?.onError?.(err instanceof Error ? err : new Error(errorMessage));
        return null;
      }
    },
    [action, options]
  );

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      data: null,
    });
  }, []);

  return {
    execute,
    reset,
    isLoading: state.isLoading,
    error: state.error,
    data: state.data,
  };
}

