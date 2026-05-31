# Claude Code — project context

<!-- cloude-code-toolbox:mcp-skills-awareness-begin -->

### MCP & Skills awareness (Cloude Code ToolBox)

_Last synced: 2026-05-30T23:29:07.947Z._

- **Full report:** `.claude/cloude-code-toolbox-mcp-skills-awareness.md` in this workspace (auto-overwritten on each scan). Use it as ground truth for configured servers and skill folders.
- **MCP:** For **live tools** in Claude Code, enable the matching server via `/mcp`. Servers are configured in `~/.claude.json` (user) and `.mcp.json` (project).
- **When the user’s task matches a server** (e.g. Confluence work and a **Confluence** / **Atlassian** MCP is listed), **prefer that server id** and plan on tool use—not only file search.
- **Skills:** Folders below contain `SKILL.md`; attach or cite paths in chat when relevant.

#### Workspace MCP

- `c:\Users\mky50\Zebe\Desktop\fitness app\.mcp.json` _(workspace: fitness app)_ — _file missing_

_No active workspace servers in mcp.json._

#### User MCP

- `C:\Users\mky50\.claude.json` — _servers defined_

| Server id | Kind | Detail |
|-----------|------|--------|
| GitKraken | stdio | c:\Users\mky50\AppData\Roaming\Code\User\globalStorage\eamodio.gitlens\gk.exe mcp --host=claude-cli --source=gitlens --scheme=vscode |
| filesystem | stdio | npx -y @modelcontextprotocol/server-filesystem C:\Users\mky50 |
| sequential-thinking | stdio | npx -y @modelcontextprotocol/server-sequential-thinking |
| github | stdio | npx -y @modelcontextprotocol/server-github |
| playwright | stdio | npx -y @playwright/mcp@latest |
| io.github.github/github-mcp-server | http | https://api.githubcopilot.com/mcp/ |

#### Project skills

_None found (or no workspace open)._

#### User skills

- **use-railway** — `C:\Users\mky50\.copilot\skills\use-railway` — >

- **alive-web** — `C:\Users\mky50\.claude\skills\alive-web` — Add modern scroll-driven and interactive 'alive' effects to a web UI — count-up numbers, filling progress rings, scroll-pinned scenes, parallax, magnetic buttons, cursor spotlights, text reveals, marquees, bento grids, g

- **use-railway** — `C:\Users\mky50\.claude\skills\use-railway` — >

- **3d-scroll-tooling** — `C:\Users\mky50\.agents\skills\3d-scroll-tooling` — Use when: researching, selecting, auditing, or implementing 3D/WebGL/WebGPU tooling, React Three Fiber, Three.js, Babylon.js, PlayCanvas, PixiJS, scroll effects, smooth scrolling, motion design, GSAP, Lenis, Motion, Anim

- **agent-md-refactor** — `C:\Users\mky50\.agents\skills\agent-md-refactor` — >-

- **angular-component** — `C:\Users\mky50\.agents\skills\angular-component` — >-

- **angular-di** — `C:\Users\mky50\.agents\skills\angular-di` — >-

- **angular-directives** — `C:\Users\mky50\.agents\skills\angular-directives` — >-

- **angular-forms** — `C:\Users\mky50\.agents\skills\angular-forms` — >-

- **angular-http** — `C:\Users\mky50\.agents\skills\angular-http` — >-

- **angular-routing** — `C:\Users\mky50\.agents\skills\angular-routing` — >-

- **angular-signals** — `C:\Users\mky50\.agents\skills\angular-signals` — >-

- **angular-ssr** — `C:\Users\mky50\.agents\skills\angular-ssr` — >-

- **angular-testing** — `C:\Users\mky50\.agents\skills\angular-testing` — >-

- **angular-tooling** — `C:\Users\mky50\.agents\skills\angular-tooling` — >-

- **appinsights-instrumentation** — `C:\Users\mky50\.agents\skills\appinsights-instrumentation` — Guidance for instrumenting webapps with Azure Application Insights. Provides telemetry patterns, SDK setup, and configuration references. WHEN: how to instrument app, App Insights SDK, telemetry patterns, what is App Ins

- **artifacts-builder** — `C:\Users\mky50\.agents\skills\artifacts-builder` — >-

- **azure-ai** — `C:\Users\mky50\.agents\skills\azure-ai` — Use for Azure AI: Search, Speech, OpenAI, Document Intelligence. Helps with search, vector/hybrid search, speech-to-text, text-to-speech, transcription, OCR. WHEN: AI Search, query search, vector search, hybrid search, s

- **azure-aigateway** — `C:\Users\mky50\.agents\skills\azure-aigateway` — Configure Azure API Management as an AI Gateway for AI models, MCP tools, and agents. WHEN: semantic caching, token limit, content safety, load balancing, AI model governance, MCP rate limiting, jailbreak detection, add 

- **azure-cloud-migrate** — `C:\Users\mky50\.agents\skills\azure-cloud-migrate` — Assess and migrate cross-cloud workloads to Azure with migration reports and code conversion. Supports AWS Lambda→Functions and GCP Cloud Run→Container Apps. WHEN: migrate Lambda to Azure Functions, migrate AWS to Azure,

- **azure-compliance** — `C:\Users\mky50\.agents\skills\azure-compliance` — Run Azure compliance and security audits with azqr plus Key Vault expiration checks. Covers best-practice assessment, resource review, policy/compliance validation, and security posture checks. WHEN: compliance scan, sec

- **azure-compute** — `C:\Users\mky50\.agents\skills\azure-compute` — Azure VM and VMSS router for recommendations, pricing, autoscale, orchestration, and connectivity troubleshooting. WHEN: Azure VM, VMSS, scale set, recommend, compare, server, website, burstable, lightweight, VM family, 

- **azure-cost** — `C:\Users\mky50\.agents\skills\azure-cost` — Unified Azure cost management: query historical costs, forecast future spending, and optimize to reduce waste. WHEN: \"Azure costs\", \"Azure spending\", \"Azure bill\", \"cost breakdown\", \"cost by service\", \"cost by

- **azure-deploy** — `C:\Users\mky50\.agents\skills\azure-deploy` — Execute Azure deployments for ALREADY-PREPARED applications that have existing .azure/deployment-plan.md and infrastructure files. DO NOT use this skill when the user asks to CREATE a new application — use azure-prepare 

- **azure-diagnostics** — `C:\Users\mky50\.agents\skills\azure-diagnostics` — Debug Azure production issues on Azure using AppLens, Azure Monitor, resource health, and safe triage. WHEN: debug production issues, troubleshoot container apps, troubleshoot functions, troubleshoot AKS, kubectl cannot 

- **azure-enterprise-infra-planner** — `C:\Users\mky50\.agents\skills\azure-enterprise-infra-planner` — Architect and provision enterprise Azure infrastructure from workload descriptions. For cloud architects and platform engineers planning networking, identity, security, compliance, and multi-resource topologies with WAF 

- **azure-hosted-copilot-sdk** — `C:\Users\mky50\.agents\skills\azure-hosted-copilot-sdk` — Build, deploy, modify GitHub Copilot SDK apps on Azure. MANDATORY when codebase contains @github/copilot-sdk or CopilotClient — use this skill instead of azure-prepare. PREFER OVER azure-prepare when codebase contains co

- **azure-kubernetes** — `C:\Users\mky50\.agents\skills\azure-kubernetes` — Plan, create, and configure production-ready Azure Kubernetes Service (AKS) clusters. Covers Day-0 checklist, SKU selection (Automatic vs Standard), networking options (private API server, Azure CNI Overlay, egress confi

- **azure-kusto** — `C:\Users\mky50\.agents\skills\azure-kusto` — Query and analyze data in Azure Data Explorer (Kusto/ADX) using KQL for log analytics, telemetry, and time series analysis. WHEN: KQL queries, Kusto database queries, Azure Data Explorer, ADX clusters, log analytics, tim

- **azure-messaging** — `C:\Users\mky50\.agents\skills\azure-messaging` — Troubleshoot and resolve issues with Azure Messaging SDKs for Event Hubs and Service Bus. Covers connection failures, authentication errors, message processing issues, and SDK configuration problems. WHEN: event hub SDK 

- **azure-prepare** — `C:\Users\mky50\.agents\skills\azure-prepare` — Prepare Azure apps for deployment (infra Bicep/Terraform, azure.yaml, Dockerfiles). Use for create/modernize or create+deploy; not cross-cloud migration (use azure-cloud-migrate). WHEN: \"create app\", \"build web app\",

- **azure-quotas** — `C:\Users\mky50\.agents\skills\azure-quotas` — Check/manage Azure quotas and usage across providers. For deployment planning, capacity validation, region selection. WHEN: \"check quotas\", \"service limits\", \"current usage\", \"request quota increase\", \"quota exc

- **azure-rbac** — `C:\Users\mky50\.agents\skills\azure-rbac` — Helps users find the right Azure RBAC role for an identity with least privilege access, then generate CLI commands and Bicep code to assign it. Also provides guidance on permissions required to grant roles. WHEN: bicep f

- **azure-resource-lookup** — `C:\Users\mky50\.agents\skills\azure-resource-lookup` — List, find, and show Azure resources across subscriptions or resource groups. Handles prompts like \"list websites\", \"list virtual machines\", \"list my VMs\", \"show storage accounts\", \"find container apps\", and \"

- **azure-resource-visualizer** — `C:\Users\mky50\.agents\skills\azure-resource-visualizer` — Analyze Azure resource groups and generate detailed Mermaid architecture diagrams showing the relationships between individual resources. WHEN: create architecture diagram, visualize Azure resources, show resource relati

- **azure-storage** — `C:\Users\mky50\.agents\skills\azure-storage` — Azure Storage Services including Blob Storage, File Shares, Queue Storage, Table Storage, and Data Lake. Provides object storage, SMB file shares, async messaging, NoSQL key-value, and big data analytics capabilities. In

- **azure-upgrade** — `C:\Users\mky50\.agents\skills\azure-upgrade` — Assess and upgrade Azure workloads between plans, tiers, or SKUs within Azure. Generates assessment reports and automates upgrade steps. WHEN: upgrade Consumption to Flex Consumption, upgrade Azure Functions plan, migrat

- **azure-validate** — `C:\Users\mky50\.agents\skills\azure-validate` — Pre-deployment validation for Azure readiness. Run deep checks on configuration, infrastructure (Bicep or Terraform), RBAC role assignments, managed identity permissions, and prerequisites before deploying. WHEN: validat

- **canvas-design** — `C:\Users\mky50\.agents\skills\canvas-design` — >-

- **changelog-generator** — `C:\Users\mky50\.agents\skills\changelog-generator` — >-

- **code-review** — `C:\Users\mky50\.agents\skills\code-review` — Review code changes for correctness, security, performance, and code quality. Use when the user asks to review a diff, review code changes, review commits, or perform a code review. Input can be: (1) a text diff pasted d

- **competitive-ads-extractor** — `C:\Users\mky50\.agents\skills\competitive-ads-extractor` — >-

- **comprehensive-review** — `C:\Users\mky50\.agents\skills\comprehensive-review` — Comprehensive code review using parallel specialized subagents. If a PR URL is provided, fetches PR details and can post comments. If no PR is provided, reviews the diff between the current branch and its base branch plu

- **content-research-writer** — `C:\Users\mky50\.agents\skills\content-research-writer` — >-

- **create-pull-request** — `C:\Users\mky50\.agents\skills\create-pull-request` — >-

- **cross-review** — `C:\Users\mky50\.agents\skills\cross-review` — Cross review code using a subagent with a specified model. Use when the user asks to review code changes AND specifies a model to use (e.g., 'review with opus', 'use sonnet to review', 'review changes with gemini'). The 

- **dbt** — `C:\Users\mky50\.agents\skills\dbt` — Skills for analytics engineering with dbt - building models, writing tests, querying the semantic layer, troubleshooting jobs, and more. Use when doing any dbt analytics engineering work.

- **dbt-migration** — `C:\Users\mky50\.agents\skills\dbt-migration` — Skills for migrating dbt projects - moving from dbt Core to the Fusion engine or across data platforms. Use when migrating dbt projects between platforms or to dbt Fusion.

- **domain-name-brainstormer** — `C:\Users\mky50\.agents\skills\domain-name-brainstormer` — >-

- **dragon-infinity** — `C:\Users\mky50\.agents\skills\dragon-infinity` — >

- **entra-app-registration** — `C:\Users\mky50\.agents\skills\entra-app-registration` — Guides Microsoft Entra ID app registration, OAuth 2.0 authentication, and MSAL integration. USE FOR: create app registration, register Azure AD app, configure OAuth, set up authentication, add API permissions, generate s

- **figma-implement-design** — `C:\Users\mky50\.agents\skills\figma-implement-design` — >-

- **file-organizer** — `C:\Users\mky50\.agents\skills\file-organizer` — >-

- **frontend-design** — `C:\Users\mky50\.agents\skills\frontend-design` — Design distinctive, production-grade frontend interfaces — mockups as HTML pages or working application pages. Use when the user asks to design a web page, landing page, UI mockup, dashboard, application page, or any vis

- **grill-me** — `C:\Users\mky50\.agents\skills\grill-me` — >-

- **image-enhancer** — `C:\Users\mky50\.agents\skills\image-enhancer` — >-

- **init** — `C:\Users\mky50\.agents\skills\init` — Use when the user asks to initialize a repo, create AGENTS.md, generate contributor guidelines, or set up agent-oriented documentation for a codebase.

- **internal-comms** — `C:\Users\mky50\.agents\skills\internal-comms` — >-

- **langsmith-fetch** — `C:\Users\mky50\.agents\skills\langsmith-fetch` — >-

- **lead-research-assistant** — `C:\Users\mky50\.agents\skills\lead-research-assistant` — >-

- **mcp-builder** — `C:\Users\mky50\.agents\skills\mcp-builder` — >-

- **meeting-insights-analyzer** — `C:\Users\mky50\.agents\skills\meeting-insights-analyzer` — >-

- **microsoft-foundry** — `C:\Users\mky50\.agents\skills\microsoft-foundry` — Deploy, evaluate, and manage Foundry agents end-to-end: Docker build, ACR push, hosted/prompt agent create, container start, batch eval, prompt optimization, prompt optimizer workflows, agent.yaml, dataset curation from 

- **plan** — `C:\Users\mky50\.agents\skills\plan` — Planning agent for task breakdown and implementation planning. Use via spawn_subagent with skill='plan' when you need to explore a codebase and design an implementation approach before writing code.

- **playwright** — `C:\Users\mky50\.agents\skills\playwright` — Browser automation with Playwright. Use when the user asks to test a website, take screenshots, check responsive design, test login flows, fill forms, check broken links, or automate any browser task.

- **research** — `C:\Users\mky50\.agents\skills\research` — Fast agent specialized for exploring codebases and searching for code patterns. Use via spawn_subagent with skill='research' for read-only exploration tasks.

- **skill-creator** — `C:\Users\mky50\.agents\skills\skill-creator` — Create new skills, modify and improve existing skills, and measure skill performance. Use when users want to create a skill from scratch, edit, or optimize an existing skill, run evals to test a skill, benchmark skill pe

- **skill-share** — `C:\Users\mky50\.agents\skills\skill-share` — >-

- **slack-gif-creator** — `C:\Users\mky50\.agents\skills\slack-gif-creator` — >-

- **theme-factory** — `C:\Users\mky50\.agents\skills\theme-factory` — >-

- **use-railway** — `C:\Users\mky50\.agents\skills\use-railway` — >

- **vercel-composition-patterns** — `C:\Users\mky50\.agents\skills\vercel-composition-patterns` — >-

- **vercel-deploy** — `C:\Users\mky50\.agents\skills\vercel-deploy` — >-

- **vercel-react-best-practices** — `C:\Users\mky50\.agents\skills\vercel-react-best-practices` — >-

- **video-downloader** — `C:\Users\mky50\.agents\skills\video-downloader` — >-

- **web-design-guidelines** — `C:\Users\mky50\.agents\skills\web-design-guidelines` — >-

- **webapp-testing** — `C:\Users\mky50\.agents\skills\webapp-testing` — >-

- **youtube-downloader** — `C:\Users\mky50\.agents\skills\youtube-downloader` — >-

<!-- cloude-code-toolbox:mcp-skills-awareness-end -->
