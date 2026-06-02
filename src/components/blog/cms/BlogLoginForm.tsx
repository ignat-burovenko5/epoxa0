"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { blogAdminHubPath } from "@/lib/blog/urls";

export default function BlogLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/blog/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ username, password }),
      });

      let data: { error?: string; ok?: boolean } = {};
      try {
        data = (await res.json()) as { error?: string; ok?: boolean };
      } catch {
        setError(`Ошибка сервера (${res.status}). Попробуйте ещё раз.`);
        return;
      }

      if (!res.ok) {
        setError(data.error ?? "Неверный логин или пароль");
        return;
      }

      router.push(blogAdminHubPath());
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? `Не удалось связаться с сервером: ${err.message}`
          : "Не удалось связаться с сервером. Проверьте, что сайт запущен.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md mx-auto space-y-6">
      <div>
        <label
          htmlFor="cms-user"
          className="block font-sans text-xs tracking-widest uppercase text-accent-gold/80 mb-2"
        >
          Логин
        </label>
        <input
          id="cms-user"
          name="username"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full bg-luxury-base border border-museum-light/20 px-4 py-3 font-sans text-sm text-museum-light focus:border-accent-gold/50 focus:outline-none"
        />
      </div>
      <div>
        <label
          htmlFor="cms-pass"
          className="block font-sans text-xs tracking-widest uppercase text-accent-gold/80 mb-2"
        >
          Пароль
        </label>
        <input
          id="cms-pass"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-luxury-base border border-museum-light/20 px-4 py-3 font-sans text-sm text-museum-light focus:border-accent-gold/50 focus:outline-none"
        />
      </div>
      {error ? (
        <p className="font-sans text-sm text-red-300/90" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full min-h-12 font-sans text-xs tracking-widest uppercase bg-accent-gold/90 text-luxury-base hover:bg-accent-gold transition-colors disabled:opacity-50"
      >
        {loading ? "Вход…" : "Войти"}
      </button>
    </form>
  );
}
