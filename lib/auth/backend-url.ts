export function getBackendUrl() {
  return (
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    process.env.BACKEND_URL?.trim() ||
    "https://api.amplypost.com"
  );
}
