import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Panel } from "@/components/ui/Panel";
import { useAuthStore } from "@/store/authStore";

const authSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Use at least 6 characters"),
});

type AuthValues = z.infer<typeof authSchema>;

export const LoginPage = () => {
  const { user, signIn, signUp } = useAuthStore();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthValues>({
    resolver: zodResolver(authSchema),
  });

  if (user) return <Navigate to="/" replace />;

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      if (mode === "signin") {
        await signIn(values.email, values.password);
      } else {
        await signUp(values.email, values.password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    }
  });

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <Panel className="w-full max-w-md">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-amber-300">
          Private relationship intelligence
        </p>
        <h1 className="mt-4 font-display text-5xl text-stone-100">Enter the archive.</h1>
        <p className="mt-3 text-sm leading-6 text-stone-400">
          Email/password auth is backed by Supabase. For personal use, create one
          account and keep registration closed in Supabase once provisioned.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
          <Input
            label="Password"
            type="password"
            error={errors.password?.message}
            {...register("password")}
          />
          {error && <p className="text-sm text-red-300">{error}</p>}
          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {mode === "signin" ? "Sign in" : "Create private account"}
          </Button>
        </form>

        <button
          className="mt-5 text-sm text-stone-400 underline decoration-amber-400/40 underline-offset-4 hover:text-amber-200"
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin" ? "Need to create the first account?" : "Already have an account?"}
        </button>
      </Panel>
    </main>
  );
};
