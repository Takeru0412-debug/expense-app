"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();

  // --- States ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // --- Handlers ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      await registerUser({ email, password });
      setSuccessMessage("ユーザー登録が完了しました。ログインしてください。");
      setEmail("");
      setPassword("");

      // 成功時に少し余韻を持たせてから遷移
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("ユーザー登録に失敗しました");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
        <h1 className="mb-8 text-center text-2xl font-bold tracking-tight text-gray-900">
          新規登録
        </h1>

        <form onSubmit={handleRegister} className="space-y-5">
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
              placeholder="6文字以上のパスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="rounded-md bg-red-50 p-3">
              <p className="text-sm font-medium text-red-600">{errorMessage}</p>
            </div>
          )}

          {successMessage && (
            <div className="rounded-md bg-green-50 p-3">
              <p className="text-sm font-medium text-green-600">{successMessage}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "登録中..." : "登録する"}
          </button>
        </form>

        <footer className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            すでにアカウントをお持ちですか？{" "}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
            >
              ログインへ
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}