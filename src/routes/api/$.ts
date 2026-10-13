import "@tanstack/react-start";
import { createFileRoute } from '@tanstack/react-router';
import { handleCatalogRequest } from 'c4-runtime';

export const Route = createFileRoute('/api/$')({
  server: {
    handlers: {
      GET: ({ request }) => handleCatalogRequest(request),
      POST: ({ request }) => handleCatalogRequest(request),
      PUT: ({ request }) => handleCatalogRequest(request),
      DELETE: ({ request }) => handleCatalogRequest(request),
    },
  },
});
