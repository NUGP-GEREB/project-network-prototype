import { getLoginUrl } from "@/const";
import {
  isStaticDemoAuthenticated,
  isStaticDemoMode,
  setStaticDemoAuthenticated,
  staticDemoUser,
} from "@/lib/staticDemo";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo, useState } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = getLoginUrl() } =
    options ?? {};
  const utils = trpc.useUtils();
  const staticMode = isStaticDemoMode();
  const [staticAuthVersion, setStaticAuthVersion] = useState(0);

  const meQuery = trpc.auth.me.useQuery(undefined, {
    enabled: !staticMode,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });

  const logout = useCallback(async () => {
    if (staticMode) {
      setStaticDemoAuthenticated(false);
      setStaticAuthVersion(version => version + 1);
      utils.auth.me.setData(undefined, null);
      window.location.href = getLoginUrl();
      return;
    }

    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        return;
      }
      throw error;
    } finally {
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    }
  }, [logoutMutation, staticMode, utils]);

  const state = useMemo(() => {
    const staticUser =
      staticMode && isStaticDemoAuthenticated() ? staticDemoUser : null;
    const user = staticMode ? staticUser : meQuery.data ?? null;

    localStorage.setItem(
      "manus-runtime-user-info",
      JSON.stringify(user)
    );
    return {
      user,
      loading: staticMode ? false : meQuery.isLoading || logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(user),
    };
  }, [
    staticMode,
    staticAuthVersion,
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
  ]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (meQuery.isLoading || logoutMutation.isPending) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    window.location.href = redirectPath
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    logoutMutation.isPending,
    meQuery.isLoading,
    state.user,
  ]);

  return {
    ...state,
    refresh: () => {
      if (staticMode) {
        setStaticAuthVersion(version => version + 1);
        return Promise.resolve({ data: state.user } as any);
      }
      return meQuery.refetch();
    },
    logout,
  };
}
