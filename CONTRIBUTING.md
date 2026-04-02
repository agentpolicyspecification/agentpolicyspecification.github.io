# Contributing to agentpolicyspecification.github.io

Thank you for your interest in improving the APS documentation site.

## Prerequisites

- Node.js 18 or later
- npm

## Getting Started

```sh
git clone https://github.com/agentpolicyspecification/agentpolicyspecification.github.io.git
cd agentpolicyspecification.github.io
npm install
npm run dev
```

The site will be available at `http://localhost:5173`.

## Repository Layout

```
.vitepress/
  config.ts   Navigation, sidebar, and site configuration
spec/         Specification documentation pages
sdk/          SDK documentation pages
schemas/      Schema reference pages
public/       Static assets (logos, images)
*.md          Top-level pages (index, introduction, faq, community, …)
```

## Making a Change

1. Fork the repository and create a branch from `main`.
2. Edit or add Markdown pages as needed.
3. Update `.vitepress/config.ts` if you add a new page that should appear in the nav or sidebar.
4. Run `npm run dev` and verify your changes look correct in the browser.
5. Open a pull request with a clear description of what changed and why.

## Content Guidelines

- Keep language clear and concise — readers may be evaluating APS for the first time.
- Use `MUST`, `SHOULD`, and `MAY` only when quoting or paraphrasing the specification. Use plain language everywhere else.
- Code examples must be accurate and runnable.
- Do not duplicate content that already exists in the specification repository — link to it instead.

## Reporting Issues

Open an issue at [github.com/agentpolicyspecification/agentpolicyspecification.github.io/issues](https://github.com/agentpolicyspecification/agentpolicyspecification.github.io/issues) for broken links, outdated content, or site bugs.

## License

By contributing you agree that your contributions will be licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0).
