variable "lob_project_id" {
  description = "The LOB Project ID where MCP containers will run"
  type        = string
}

variable "platform_sa_email" {
  description = "The Hub Platform Orchestrator Service Account Email"
  type        = string
}

resource "google_project_iam_member" "run_admin" {
  project = var.lob_project_id
  role    = "roles/run.admin"
  member  = "serviceAccount:${var.platform_sa_email}"
}

resource "google_project_iam_member" "build_editor" {
  project = var.lob_project_id
  role    = "roles/cloudbuild.builds.editor"
  member  = "serviceAccount:${var.platform_sa_email}"
}

resource "google_project_iam_member" "sa_user" {
  project = var.lob_project_id
  role    = "roles/iam.serviceAccountUser"
  member  = "serviceAccount:${var.platform_sa_email}"
}
