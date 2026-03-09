import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useGetGoal() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["goal"],
    queryFn: async () => {
      if (!actor) return BigInt(2000);
      return actor.getGoal();
    },
    enabled: !!actor && !isFetching,
    initialData: BigInt(2000),
  });
}

export function useGetTodayEntries() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["todayEntries"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTodayEntries();
    },
    enabled: !!actor && !isFetching,
    initialData: [],
    refetchInterval: 30_000,
  });
}

export function useAddEntry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (amountMl: number) => {
      if (!actor) return;
      await actor.addEntry(BigInt(amountMl));
    },
    onMutate: async (amountMl) => {
      await qc.cancelQueries({ queryKey: ["todayEntries"] });
      const prev = qc.getQueryData(["todayEntries"]);
      qc.setQueryData(["todayEntries"], (old: any[]) => [
        ...(old || []),
        {
          id: `optimistic-${Date.now()}`,
          amountMl: BigInt(amountMl),
          timestamp: BigInt(Date.now()) * BigInt(1_000_000),
        },
      ]);
      return { prev };
    },
    onError: (_err: unknown, _amt: number, ctx: any) => {
      if (ctx?.prev) qc.setQueryData(["todayEntries"], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["todayEntries"] });
    },
  });
}

export function useSetGoal() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (goal: number) => {
      if (!actor) return;
      await actor.setGoal(BigInt(goal));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goal"] });
    },
  });
}

export function useClearTodayEntries() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) return;
      await actor.clearTodayEntries();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["todayEntries"] });
    },
  });
}
