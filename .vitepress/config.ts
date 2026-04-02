import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";

export default withMermaid(defineConfig({
  title: "Agent Policy Specification",
  vite: {
    build: {
      chunkSizeWarningLimit: 1000,
    },
  },
  description: "A vendor-neutral standard for enforcing policies on AI agent interactions.",
  cleanUrls: true,

  head: [
    ["meta", { name: "og:title", content: "Agent Policy Specification (APS)" }],
    ["meta", { name: "og:description", content: "A vendor-neutral standard for enforcing policies on AI agent interactions." }],
  ],

  themeConfig: {
    logo: { light: "/aps-logo-light.svg", dark: "/aps-logo-dark-nobg.svg" },
    siteTitle: "APS",

    nav: [
      { text: "Specification", link: "/spec/core" },
      { text: "Implementations", link: "/implementations" },
      {
        text: "SDK",
        items: [
          { text: "TypeScript", link: "/sdk/typescript" },
          { text: "Java", link: "/sdk/java" },
          {
            text: "Integrations",
            items: [
              { text: "Vercel AI SDK", link: "/sdk/integrations/ai-sdk" },
              { text: "Mastra", link: "/sdk/integrations/mastra" },
              { text: "Ollama", link: "/sdk/integrations/ollama" },
            ],
          },
        ],
      },
      { text: "FAQ", link: "/faq" },
      { text: "Community", link: "/community" },
      {
        text: "GitHub",
        link: "https://github.com/agentpolicyspecification",
      },
    ],

    sidebar: [
      {
        text: "Introduction",
        items: [
          { text: "What is APS?", link: "/introduction" },
          { text: "Implementations", link: "/implementations" },
          { text: "Versioning", link: "/versioning" },
          { text: "FAQ", link: "/faq" },
          { text: "Community", link: "/community" },
        ],
      },
      {
        text: "Specification",
        items: [
          { text: "Core Concepts", link: "/spec/core" },
          { text: "Input Policy", link: "/spec/input-policy" },
          { text: "Tool Call Policy", link: "/spec/tool-call-policy" },
          { text: "Output Policy", link: "/spec/output-policy" },
          { text: "Enforcement Contract", link: "/spec/enforcement-contract" },
          { text: "Policy Authoring", link: "/spec/policy-authoring" },
        ],
      },
      {
        text: "SDK",
        items: [
          { text: "TypeScript", link: "/sdk/typescript" },
          { text: "Java", link: "/sdk/java" },
          {
            text: "Integrations",
            collapsed: false,
            items: [
              { text: "Vercel AI SDK", link: "/sdk/integrations/ai-sdk" },
              { text: "Mastra", link: "/sdk/integrations/mastra" },
              { text: "Ollama", link: "/sdk/integrations/ollama" },
            ],
          },
        ],
      },
      {
        text: "Schemas",
        items: [
          { text: "InputContext", link: "/schemas/input-context" },
          { text: "ToolCallContext", link: "/schemas/tool-call-context" },
          { text: "OutputContext", link: "/schemas/output-context" },
          { text: "PolicyDecision", link: "/schemas/policy-decision" },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/agentpolicyspecification" },
    ],

    editLink: {
      pattern: "https://github.com/agentpolicyspecification/spec/edit/main/:path",
      text: "Edit this page on GitHub",
    },

    footer: {
      message: "Released under the Apache 2.0 License.",
      copyright: "Agent Policy Specification",
    },

    search: {
      provider: "local",
    },
  },
}));
