import { getToken } from "./auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL が設定されていません");
}

export type RegisterRequest = {
  email: string;
  password: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
};

export type User = {
  id: number;
  email: string;
  created_at: string;
};

export type Expense = {
  id: number;
  title: string;
  amount: number;
  category: string;
  spent_at: string;
  memo?: string | null;
  created_at: string;
  user_id: number;
};

export type ExpenseCreateRequest = {
  title: string;
  amount: number;
  category: string;
  spent_at: string;
  memo?: string | null;
};

export type ExpenseUpdateRequest = {
  title: string;
  amount: number;
  category: string;
  spent_at: string;
  memo?: string | null;
};

function buildHeaders(isJson: boolean = true): HeadersInit {
  const token = getToken();
  const headers: HeadersInit = {};

  if (isJson) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

export async function registerUser(data: RegisterRequest): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || "ユーザー登録に失敗しました");
  }

  return response.json();
}

export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || "ログインに失敗しました");
  }

  return response.json();
}

export async function fetchMe(): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/me`, {
    method: "GET",
    headers: buildHeaders(false),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || "ユーザー情報の取得に失敗しました");
  }

  return response.json();
}

export async function fetchExpenses(): Promise<Expense[]> {
  const response = await fetch(`${API_BASE_URL}/expenses/`, {
    method: "GET",
    headers: buildHeaders(false),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || "支出一覧の取得に失敗しました");
  }

  return response.json();
}

export async function createExpense(data: ExpenseCreateRequest): Promise<Expense> {
  const response = await fetch(`${API_BASE_URL}/expenses/`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || "支出の登録に失敗しました");
  }

  return response.json();
}

export async function updateExpense(
  id: number,
  data: ExpenseUpdateRequest
): Promise<Expense> {
  const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: "PUT",
    headers: buildHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || "支出の更新に失敗しました");
  }

  return response.json();
}

export async function deleteExpense(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: "DELETE",
    headers: buildHeaders(false),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || "支出の削除に失敗しました");
  }
}