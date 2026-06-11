export type AppView = "events" | "customers" | "import";

export const APP_ROUTES: Record<AppView, string> = {
  events: "/events",
  customers: "/customers",
  import: "/customers/import"
};

export function getAppView(pathname: string): AppView {
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";

  if (normalizedPath === APP_ROUTES.customers) {
    return "customers";
  }

  if (normalizedPath === APP_ROUTES.import) {
    return "import";
  }

  return "events";
}
