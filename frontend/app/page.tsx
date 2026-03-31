"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
  Calendar,
  Edit2,
  Trash2,
  JapaneseYen,
  Plus,
  X,
} from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL が設定されていません。");
}

const CATEGORIES = [
  "食費",
  "交通費",
  "日用品",
  "娯楽",
  "住居費",
  "水道光熱費",
  "通信費",
  "医療費",
  "交際費",
  "その他",
];

const COLORS = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#f43f5e",
  "#8b5cf6",
  "#ec4899",
  "#22c55e",
  "#f97316",
  "#64748b",
  "#94a3b8",
];

interface Expense {
  id: number;
  title: string;
  amount: number;
  category: string;
  spent_at: string;
  memo: string | null;
  created_at?: string;
}

export default function FinanceDashboard() {
  const [mounted, setMounted] = useState(false);

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedMonth, setSelectedMonth] = useState("");

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [spentAt, setSpentAt] = useState("");
  const [memo, setMemo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editSpentAt, setEditSpentAt] = useState("");
  const [editMemo, setEditMemo] = useState("");
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  const fetchExpenses = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/expenses/`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("支出一覧の取得に失敗しました");
      }

      const data: Expense[] = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchExpenses();
  }, [fetchExpenses]);

  const resetCreateForm = () => {
    setTitle("");
    setAmount("");
    setCategory("");
    setSpentAt("");
    setMemo("");
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingId(null);
    setEditTitle("");
    setEditAmount("");
    setEditCategory("");
    setEditSpentAt("");
    setEditMemo("");
  };

  const openEditModal = (expense: Expense) => {
    setEditingId(expense.id);
    setEditTitle(expense.title);
    setEditAmount(String(expense.amount));
    setEditCategory(expense.category);
    setEditSpentAt(expense.spent_at);
    setEditMemo(expense.memo ?? "");
    setIsEditModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !amount || !category || !spentAt) {
      alert("必須項目を入力してください");
      return;
    }

    const expenseData = {
      title,
      amount: Number(amount),
      category,
      spent_at: spentAt,
      memo: memo || null,
    };

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/expenses/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(expenseData),
      });

      if (!response.ok) {
        throw new Error("登録に失敗しました");
      }

      resetCreateForm();
      await fetchExpenses();
    } catch (error) {
      console.error("Create error:", error);
      alert("登録に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId === null) return;

    if (!editTitle || !editAmount || !editCategory || !editSpentAt) {
      alert("必須項目を入力してください");
      return;
    }

    const expenseData = {
      title: editTitle,
      amount: Number(editAmount),
      category: editCategory,
      spent_at: editSpentAt,
      memo: editMemo || null,
    };

    setIsEditSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/expenses/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(expenseData),
      });

      if (!response.ok) {
        throw new Error("更新に失敗しました");
      }

      closeEditModal();
      await fetchExpenses();
    } catch (error) {
      console.error("Edit error:", error);
      alert("更新に失敗しました");
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = window.confirm("このデータを削除しますか？");
    if (!isConfirmed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("削除に失敗しました");
      }

      if (editingId === id) {
        closeEditModal();
      }

      await fetchExpenses();
    } catch (error) {
      console.error("Delete error:", error);
      alert("削除に失敗しました");
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((e) => (selectedMonth ? e.spent_at.startsWith(selectedMonth) : true))
      .sort((a, b) => b.spent_at.localeCompare(a.spent_at));
  }, [expenses, selectedMonth]);

  const totalAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  const chartData = useMemo(() => {
    const totals = filteredExpenses.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

    return Object.entries(totals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white px-6 py-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-600 p-2 text-white">
              <JapaneseYen className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">家計簿ダッシュボード</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-sm font-medium outline-none"
              />
            </div>

            {selectedMonth && (
              <button
                type="button"
                onClick={() => setSelectedMonth("")}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
              >
                月解除
              </button>
            )}
          </div>
        </header>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="space-y-6 xl:col-span-4">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-lg font-bold">新規登録</h2>
                <p className="text-sm text-slate-500">
                  支出データを追加します
                </p>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">内容</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="例: ランチ"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">金額</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="例: 1200"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">カテゴリ</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500"
                    required
                  >
                    <option value="">カテゴリを選択してください</option>
                    {CATEGORIES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">支出日</label>
                  <input
                    type="date"
                    value={spentAt}
                    onChange={(e) => setSpentAt(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">メモ</label>
                  <textarea
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    rows={3}
                    placeholder="補足があれば入力"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Plus className="h-4 w-4" />
                  {isSubmitting ? "登録中..." : "登録する"}
                </button>
              </form>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-widest text-slate-400">
                合計支出
              </p>
              <div className="mt-4 text-4xl font-black text-indigo-600">
                ¥{totalAmount.toLocaleString()}
              </div>

              <div className="mt-6 space-y-3">
                {chartData.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    表示できるデータがありません。
                  </p>
                ) : (
                  chartData.slice(0, 5).map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />
                        <span className="text-sm text-slate-500">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-sm font-bold">
                        ¥{item.value.toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <div className="space-y-6 xl:col-span-8">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-sm font-bold uppercase tracking-widest text-slate-400">
                支出内訳
              </h2>

              {chartData.length === 0 ? (
                <div className="flex h-[320px] items-center justify-center text-slate-500">
                  グラフ表示用のデータがありません
                </div>
              ) : (
                <div className="h-[380px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={90}
                        outerRadius={140}
                        paddingAngle={6}
                        stroke="none"
                        label
                      >
                        {chartData.map((_, i) => (
                          <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: "16px",
                          backgroundColor: "#fff",
                          border: "none",
                          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                        }}
                        itemStyle={{ color: "#1e293b" }}
                        formatter={(v: number | string | undefined) =>
                          typeof v === "number" ? `¥${v.toLocaleString()}` : v
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-4">
                <h2 className="text-lg font-bold">支出一覧</h2>
                <p className="text-sm text-slate-500">
                  {selectedMonth
                    ? `${selectedMonth} のデータを表示中`
                    : "すべてのデータを表示中"}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-6 py-4">日付</th>
                      <th className="px-6 py-4">内容</th>
                      <th className="px-6 py-4">カテゴリ</th>
                      <th className="px-6 py-4 text-right">金額</th>
                      <th className="px-6 py-4">メモ</th>
                      <th className="px-6 py-4">操作</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredExpenses.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-10 text-center text-slate-500"
                        >
                          該当する支出データがありません。
                        </td>
                      </tr>
                    ) : (
                      filteredExpenses.map((e) => (
                        <tr
                          key={e.id}
                          className="transition-colors hover:bg-slate-50/50"
                        >
                          <td className="px-6 py-4 text-slate-500">{e.spent_at}</td>
                          <td className="px-6 py-4 font-bold">{e.title}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                              {e.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-black text-indigo-600">
                            ¥{e.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {e.memo ?? ""}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEditModal(e)}
                                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-indigo-500"
                                title="編集"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(e.id)}
                                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-rose-500"
                                title="削除"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </section>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">支出を編集</h2>
                <p className="text-sm text-slate-500">
                  内容を修正して更新してください
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">内容</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">金額</label>
                <input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">カテゴリ</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500"
                  required
                >
                  <option value="">カテゴリを選択してください</option>
                  {CATEGORIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">支出日</label>
                <input
                  type="date"
                  value={editSpentAt}
                  onChange={(e) => setEditSpentAt(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">メモ</label>
                <textarea
                  value={editMemo}
                  onChange={(e) => setEditMemo(e.target.value)}
                  rows={3}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isEditSubmitting}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isEditSubmitting ? "更新中..." : "更新する"}
                </button>

                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-2xl bg-slate-200 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-300"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}