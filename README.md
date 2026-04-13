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

## ✨ Key Advantages

- **Centralized Multi-Tenant Management**: A single control plane to orchestrate MCP agents across isolated LOB projects.
- **Secure IAM Proxying**: The `platform-orchestrator-api` prevents the need for broad IAM permissions for end-users by acting as a secure intermediary.
- **Automated CI/CD Pipelines**: One-click deployment from GitHub to Cloud Run using optimized Google Cloud Build steps.
- **Real-time Observability**: Track deployment traces and global fleet metrics directly from a premium, high-fidelity dashboard.
- **Scalable Hub-and-Spoke Model**: Easily onboard new LOBs with minimal configuration while maintaining strict resource isolation.
- **Developer-Centric Experience**: Simplified agent registration and automatic generation of Claude Desktop configurations.

---

## 📸 UI Screenshots

### Global Fleet Overview
Displays real-time metrics and the status of all active MCP agent clusters across the enterprise.
![Global Fleet Overview](./docs/images/admin_fleet_view.png)

### MCP Agent Deployment
A streamlined interface for LOB developers to register projects and trigger automated builds.
![MCP Agent Deployment](./docs/images/deployments_view.png)

---

---

## 🔒 Decommissioning Notice

The live testing environment for this project has been decommissioned. All GCP resources (Cloud Run services, IAM members, and Service Accounts) have been destroyed using Terraform and the `gcloud` CLI as of the final commit. 

For local development and testing, refer to the **Architecture & Flow** section to provision your own Hub-and-Spoke model in Google Cloud.

