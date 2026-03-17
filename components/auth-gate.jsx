"use client";

import { useEffect, useState, useTransition } from "react";
import { useAppState } from "@/lib/store";
import { getSupabaseBrowserClient, hasSupabaseEnv, isDemoEnabled } from "@/lib/supabase";

export function AuthGate({ children }) {
  const { state, actions, hydrated } = useAppState();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [bootstrapping, setBootstrapping] = useState(false);
  const [pending, startTransition] = useTransition();

  async function hydrateAuthenticatedState(session) {
    if (!session?.access_token || !session.user) {
      return;
    }

    setBootstrapping(true);
    actions.setUser({
      email: session.user.email,
      mode: "supabase",
      accessToken: session.access_token
    });

    try {
      const response = await fetch("/api/bootstrap", {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error("Unable to load your account data.");
      }

      const remoteState = await response.json();
      actions.replaceState(remoteState, {
        email: session.user.email,
        mode: "supabase",
        accessToken: session.access_token
      });
    } catch (bootstrapError) {
      setMessage(bootstrapError.message);
    } finally {
      setBootstrapping(false);
    }
  }

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client) {
      return;
    }

    client.auth.getSession().then(({ data }) => {
      if (data.session) {
        hydrateAuthenticatedState(data.session);
      }
    });

    const {
      data: { subscription }
    } = client.auth.onAuthStateChange((_event, session) => {
      if (session) {
        hydrateAuthenticatedState(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [actions]);

  if (!hydrated) {
    return <div className="auth-screen"><div className="auth-card"><p>Loading your coach...</p></div></div>;
  }

  if (bootstrapping) {
    return <div className="auth-screen"><div className="auth-card"><p>Loading your saved plan and profile...</p></div></div>;
  }

  if (state.user) {
    return children;
  }

  async function handleAuth(event) {
    event.preventDefault();
    setMessage("");

    const client = getSupabaseBrowserClient();
    if (!client) {
      if (isDemoEnabled()) {
        actions.enterDemo();
        return;
      }
      setMessage("Demo mode is disabled. Add Supabase environment variables to sign in.");
      return;
    }

    startTransition(async () => {
      const authMethod = mode === "signup"
        ? client.auth.signUp({ email, password })
        : client.auth.signInWithPassword({ email, password });

      const { error, data } = await authMethod;

      if (error) {
        setMessage(error.message);
        return;
      }

      if (data.user) {
        if (data.session) {
          await hydrateAuthenticatedState(data.session);
        }
      }

      if (mode === "signup") {
        setMessage("Account created. If your Supabase project requires email confirmation, confirm your inbox and then sign in.");
      }
    });
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <p className="eyebrow">TPAI Life Coach</p>
        <h1>Phone-first coaching for the hours your job doesn&apos;t structure.</h1>
        <p className="subtle">
          Check in, build a real plan around work, and keep score on the habits and promises that matter.
        </p>

        <form className="auth-form" onSubmit={handleAuth}>
          {hasSupabaseEnv() && (
            <>
              <label>
                Email
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />
              </label>
              <label>
                Password
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Minimum 6 characters" required />
              </label>
            </>
          )}

          <button type="submit" className="primary-button" disabled={pending}>
            {hasSupabaseEnv()
              ? (mode === "signup" ? "Create account" : "Sign in")
              : "Enter demo mode"}
          </button>
        </form>

        {hasSupabaseEnv() && (
          <button type="button" className="ghost-button" onClick={() => setMode(mode === "signup" ? "signin" : "signup")}>
            {mode === "signup" ? "Already have an account? Sign in" : "Need an account? Create one"}
          </button>
        )}

        {!hasSupabaseEnv() && (
          <p className="subtle">
            {isDemoEnabled()
              ? "Supabase keys are not set, so the app can still run in demo mode with browser-local persistence."
              : "Supabase keys are not set and demo mode is disabled, so production configuration is required."}
          </p>
        )}

        {message && <p className="subtle">{message}</p>}
      </div>
    </div>
  );
}
