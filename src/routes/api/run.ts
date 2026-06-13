import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/run")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const res = await fetch(
            "https://api.codingshuttle.com/api/classroom/quickCompiler/run",
            {
              method: "POST",
              headers: {
                "content-type": "application/json",
                accept: "application/json, text/plain, */*",
                origin: "https://www.codingshuttle.com",
                referer: "https://www.codingshuttle.com/",
              },
              body: JSON.stringify({
                language: "java",
                code: body.code ?? "",
                stdin: body.stdin ?? "",
                filename: "Main",
              }),
            },
          );
          const text = await res.text();
          return new Response(text, {
            status: res.status,
            headers: { "content-type": "application/json" },
          });
        } catch (e) {
          return new Response(
            JSON.stringify({ error: (e as Error).message }),
            { status: 500, headers: { "content-type": "application/json" } },
          );
        }
      },
    },
  },
});
