# Java Playground & Quick Compiler

A modern, standalone web-based interactive playground to compile and run Java programs right from your browser. Built using React, TypeScript, TanStack Start, Tailwind CSS, and CodeMirror.

## Features

### 💻 Rich Code Editor
- **Syntax Highlighting**: Real-time Java code syntax highlighting powered by CodeMirror.
- **Multiple Fonts**: Choose between popular developer fonts like *JetBrains Mono*, *Fira Code*, *Menlo*, *Consolas*, or your system's default monospace.
- **Adjustable Size**: Custom font sizes matching your layout preferences.
- **Indentation Controls**: Choose tab widths (2, 4, or 8 spaces) with native `Tab` key spacing integration.
- **Code Actions**: Copy code to the clipboard, and easily reset to the template code.
- **Utility Toggles**: Toggle word wrap and line numbers to fit your preference.

### 🎨 Premium UI/UX
- **Dark & Light Modes**: Seamless theme switching (VSCode Dark and GitHub Light).
- **Execution Metadata**: Detailed runtime details including execution time and memory footprint (if available).
- **Separate Stdin Input**: Dedicated console panel to pass inputs to Java console-based programs (`Scanner` or `BufferedReader`).

---

## Technical Stack

- **Framework**: [TanStack Start](https://tanstack.com/router/latest/docs/start/overview) (React Server Components & SSR-first framework)
- **Bundler & Build Tool**: [Vite](https://vite.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Editor**: [CodeMirror 6](https://codemirror.net/) (via `@uiw/react-codemirror`)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## Local Setup & Development

Follow these steps to run the application locally on your machine:

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v18 or higher recommended).

### 2. Install Dependencies
Navigate to the project directory and install the required npm packages:
```bash
npm install
```

### 3. Run Development Server
Start the local development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or the port shown in your terminal) in your browser to view the playground.

### 4. Build for Production
To create a production-optimized build:
```bash
npm run build
```
This builds both the client assets and the server-side environment ready for deployment.
