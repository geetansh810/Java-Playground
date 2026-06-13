import { createFileRoute } from "@tanstack/react-router";
import JavaEditor from "@/components/JavaEditor";

const TITLE = "Java Online Compiler & Code Editor — Java Playground";
const DESC =
  "Free online Java compiler and code editor. Write, run, and test Java code instantly in your browser with stdin support, fast execution, and a clean VS Code-inspired UI.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      {
        name: "keywords",
        content:
          "java compiler, online java compiler, java code editor, run java online, java playground, online java IDE, java repl, free java compiler",
      },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  return <JavaEditor />;
}
