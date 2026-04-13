variable "project_id" {
  description = "The Platform Hub Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region for Hub resources"
  type        = string
  default     = "us-central1"
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# 1. Enable APIs
resource "google_project_service" "services" {
  for_each = toset([
    "run.googleapis.com",
    "cloudbuild.googleapis.com",
    "firestore.googleapis.com",
    "identitytoolkit.googleapis.com"
  ])
  service            = each.key
  disable_on_destroy = false
}

# 2. Platform Orchestrator Service Account
resource "google_service_account" "orchestrator_sa" {
  account_id   = "platform-orchestrator"
  display_name = "Platform Orchestrator SA for LOB MCP Deployments"
  depends_on   = [google_project_service.services]
}

# 3. Global External HTTP(S) Load Balancer IP
resource "google_compute_global_address" "mcp_lb_ip" {
  name       = "mcp-lb-ipv4"
  depends_on = [google_project_service.services]
}
