import { liveQuery } from 'dexie';
import { useEffect, useState } from 'react';

/**
 * Consulta reativa ao IndexedDB: devolve `undefined` enquanto carrega e
 * atualiza sozinha quando os dados consultados mudam.
 */
export function useLive<T>(query: () => Promise<T>, deps: readonly unknown[]): T | undefined {
  const [value, setValue] = useState<T | undefined>(undefined);
  useEffect(() => {
    const subscription = liveQuery(query).subscribe({
      next: (result) => setValue(() => result),
      error: (error: unknown) => console.error('Erro ao ler os dados locais', error),
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return value;
}
