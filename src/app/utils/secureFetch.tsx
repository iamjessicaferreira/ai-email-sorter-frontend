
export async function secureFetch(
    url: string,
    options: RequestInit = {},
    onUnauthorized?: () => void
  ): Promise<Response> {
    const res = await fetch(url, { ...options, credentials: "include" });
    if (res.status === 401 || res.status === 403) {
      if (typeof onUnauthorized === "function") {
        onUnauthorized();
      }
      throw new Error("Unauthorized");
    }
    return res;
  }
  