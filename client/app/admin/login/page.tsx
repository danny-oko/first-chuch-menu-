"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { setAdminToken } from "@/lib/auth";
import { t } from "@/lib/i18n";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { token } = await api.adminLogin(username, password);
      setAdminToken(token);
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.loginFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg ring-1 ring-zinc-200"
      >
        <h1 className="text-2xl font-bold text-zinc-900">{t.adminLogin}</h1>
        <p className="mt-1 text-sm text-zinc-500">{t.adminLoginHint}</p>

        <div className="mt-6 space-y-4">
          <div>
            <Label htmlFor="username">{t.username}</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1.5"
              autoComplete="username"
            />
          </div>
          <div>
            <Label htmlFor="password">{t.password}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5"
              autoComplete="current-password"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full rounded-xl" disabled={loading}>
            {loading ? t.signingIn : t.signIn}
          </Button>
        </div>
      </form>
    </div>
  );
}
