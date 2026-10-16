import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import { CatalogProvider } from "@/data/catalog";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "C4 IMPORTS" },
      { name: "description", content: "C4 IMPORTS" },
      { name: "author", content: "C4 IMPORTS" },
      { property: "og:title", content: "C4 IMPORTS" },
      { property: "og:description", content: "C4 IMPORTS" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "C4 IMPORTS" },
      { name: "twitter:description", content: "C4 IMPORTS" },
      { property: "og:image", content: "https://c4conect1.c4conect1.workers.dev/c4-imports.png" },
      { name: "twitter:image", content: "https://c4conect1.c4conect1.workers.dev/c4-imports.png" },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/c4-imports.png" },
      { rel: "apple-touch-icon", href: "/c4-imports.png" },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <CatalogProvider><div className="mobile-app"><Outlet /></div></CatalogProvider>;
}
