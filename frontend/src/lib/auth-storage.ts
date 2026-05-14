const TOKEN_KEY = "cash_custody_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage.getItem(TOKEN_KEY);
}

export function storeToken(token: string): void {
  window.sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  window.sessionStorage.removeItem(TOKEN_KEY);
}
