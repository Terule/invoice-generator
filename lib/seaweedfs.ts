const filerUrl = process.env.SEAWEEDFS_URL ?? "http://seaweedfs:8888";

export function getSeaweedFsUrl(path: string) {
  return new URL(path, filerUrl).toString();
}
