const filerUrl = process.env.SEAWEEDFS_URL ?? "http://seaweedfs:8888";
const retryDelays = [250, 500, 1_000, 2_000];

export function getSeaweedFsUrl(path: string) {
  return new URL(path, filerUrl).toString();
}

/** Retries only connection failures while the filer is coming online. */
export async function fetchSeaweedFs(path: string, init?: RequestInit) {
  let lastError: unknown;

  for (const [attempt, delay] of retryDelays.entries()) {
    try {
      return await fetch(getSeaweedFsUrl(path), init);
    } catch (error) {
      lastError = error;

      if (attempt < retryDelays.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
