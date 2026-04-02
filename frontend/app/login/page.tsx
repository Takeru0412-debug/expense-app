"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser } from "@/lib/api";
import { saveToken } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  // --- States ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // --- Handlers ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const data = await loginUser({ email, password });
      saveToken(data.access_token);
      router.push("/");
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("ログインに失敗しました");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
        <h1 className="mb-8 text-center text-2xl font-bold tracking-tight text-gray-900">
          ログイン
        </h1>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">
              メールアドレス
            </label>
            <input
              type="email"
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-gray-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">
              パスワード
            </label>
            <input
              type="password"
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-gray-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="rounded-md bg-red-50 p-3">
              <p className="text-sm font-medium text-red-600">{errorMessage}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </form>

        <footer className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            アカウントをお持ちでないですか？{" "}
            <Link
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
            >
              新規登録へ
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}