import type { User } from "@/types";

const TOKEN_KEY = "cash_custody_token";
const USER_KEY = "cash_custody_user";
let memoryToken: string | null = null;
let memoryUser: User | null = null;

export function getStoredToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage.getItem(TOKEN_KEY) ?? window.sessionStorage.getItem(TOKEN_KEY) ?? getCookieToken() ?? memoryToken;
  } catch {
    return getCookieToken() ?? memoryToken;
  }
}

export function storeToken(token: string): void {
  memoryToken = token;

  try {
    window.localStorage.setItem(TOKEN_KEY, token);
    window.sessionStorage.setItem(TOKEN_KEY, token);
    document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; Path=/; SameSite=Lax; Max-Age=604800`;
  } catch {
    // Some mobile/private browsers can restrict storage. Keep the in-memory token for the current page session.
  }
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const value = window.localStorage.getItem(USER_KEY) ?? window.sessionStorage.getItem(USER_KEY) ?? getCookieValue(USER_KEY);
    return value ? JSON.parse(value) as User : memoryUser;
  } catch {
    return memoryUser;
  }
}

export function storeUser(user: User): void {
  memoryUser = user;
  const value = JSON.stringify(user);

  try {
    window.localStorage.setItem(USER_KEY, value);
    window.sessionStorage.setItem(USER_KEY, value);
    document.cookie = `${USER_KEY}=${encodeURIComponent(value)}; Path=/; SameSite=Lax; Max-Age=604800`;
  } catch {
    // Some mobile/private browsers can restrict storage. Keep the in-memory user for the current page session.
  }
}

export function clearStoredToken(): void {
  memoryToken = null;
  memoryUser = null;

  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.removeItem(USER_KEY);
    document.cookie = `${TOKEN_KEY}=; Path=/; SameSite=Lax; Max-Age=0`;
    document.cookie = `${USER_KEY}=; Path=/; SameSite=Lax; Max-Age=0`;
  } catch {
    // Storage may be unavailable in some mobile/private contexts.
  }
}

function getCookieToken(): string | null {
  return getCookieValue(TOKEN_KEY);
}

function getCookieValue(key: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const prefix = `${key}=`;
  const value = document.cookie
    .split("; ")
    .find((item) => item.startsWith(prefix))
    ?.slice(prefix.length);

  return value ? decodeURIComponent(value) : null;
}
