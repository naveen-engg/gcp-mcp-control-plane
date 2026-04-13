# MCP Enterprise Control Plane

An orchestration platform built to centrally manage, deploy, and monitor Model Context Protocol (MCP) agents across multiple Line of Business (LOB) environments in Google Cloud.

**Suggested Repository Name:** `gcp-mcp-control-plane`

---

## 🏗 Architecture & Flow

```mermaid
flowchart TD
    subgraph Enterprise["Enterprise Architecture"]
        LOB_U["LOB User / Data Scientist"]:::user
        PA_U["Platform Admin"]:::user
    end

    subgraph Hub["Platform Hub Project (mcp-platform-hub)"]
        UI["React Dashboard (Cloud Run)\ngcp-mcp-dashboard...run.app"]:::ui
        API["platform-orchestrator-api (Cloud Run)\nPython FastAPI"]:::backend
        SA["Platform Orchestrator SA"]:::identity
    end

    subgraph Github["Source Control"]
        repo["github.com/naveen-engg/sample-lob"]
    end

    subgraph LOB["Line of Business Project (mcp-lob-sales)"]
        CR["Agent Instance (Cloud Run)\nmcp-lob-sales-agent...run.app"]:::target
        CB["Cloud Build"]:::pipeline
    end

    LOB_U -- "1. Submits GitHub Repo & Project ID" --> UI
    PA_U -- "Monitors Global Fleet" --> UI
    UI -- "2. POST /deploy" --> API
    
    API -- "3. Assumes Identity" --> SA
    SA -- "4. Triggers Cloud Build SDK" --> CB
    CB -- "5. Pulls Code" --> repo
    CB -- "6. Compiles Docker & Deploys Source" --> CR
    
    CR -- "7. Streams Health & Metadata" --> API

    classDef user fill:#6366f1,stroke:#4338ca,stroke-width:2px,color:#fff;
    classDef ui fill:#10b981,stroke:#059669,stroke-width:2px,color:#fff;
    classDef backend fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#fff;
    classDef target fill:#8b5cf6,stroke:#7c3aed,stroke-width:2px,color:#fff;
    classDef pipeline fill:#3b82f6,stroke:#2563eb,stroke-width:2px,color:#fff;
    classDef identity fill:#ef4444,stroke:#dc2626,stroke-width:2px,color:#fff;
```

### Components

#### 1. React Dashboard (`mcp-dashboard-(url).run.app`)
The visual front-door. LOB users use this portal to register their Google Cloud project ID and their MCP Agent Github Repository.

#### 2. The `platform-orchestrator-api`
**What is its purpose?** 
In a standard organization, Central IT cannot simply give 500 different LOB developers `Cloud Run Admin` and `Organization Admin` roles. It's a massive security risk. Instead, developers authenticate to the Dashboard, which communicates with the Orchestrator API. The Orchestrator API holds the highly-scoped Service Account. It validates the user's intent, creates a secure deployment pipeline footprint, and handles all CI/CD Cloud Build push events without exposing GCP keys to the end-users.

#### 3. Line of Business Modules
The destination projects where the actual AI Agents run (`sample-lob`). The output is a secure Service URL that LOB owners can configure Claude Desktop with via OAuth parameters.

---

## 🚀 Live Testing URLs

*   **Platform Dashboard (LOB & Admin UI):** https://mcp-dashboard-668628440470.us-central1.run.app 
*   **Orchestrator API (Backend):** https://platform-orchestrator-api-668628440470.us-central1.run.app

### How to Deploy an Agent
1. Visit the Platform Dashboard URL.
2. Navigate to **Deployments**.
3. Input `mcp-lob-sales` for the GCP Project ID.
4. Input `https://github.com/naveen-engg/sample-lob` for the Repo.
5. Click **Deploy** to observe the Orchestrator push the Cloud Build instructions directly to the target environment.
