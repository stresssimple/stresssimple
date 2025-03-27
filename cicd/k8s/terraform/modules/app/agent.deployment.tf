resource "kubernetes_deployment" "agent_deployment" {
  metadata {
    name      = "backend-agent"
    namespace = var.namespace
    annotations = {
      "app"       = var.app_name
      "component" = "backend-agent"
    }
  }


  spec {
    replicas = var.backend-agent-replicas

    selector {
      match_labels = {
        app       = var.app_name
        component = "backend-agent"
      }
    }

    template {
      metadata {
        labels = {
          app       = var.app_name
          component = "backend-agent"
        }
      }

      spec {
        container {
          image             = "ghcr.io/${var.project_id}/backend:${var.backend_version}"
          image_pull_policy = "Always"
          name              = "backend-agent"
          command           = ["npm", "run", "start:agent:prod"]
          port {
            container_port = 3000
          }
          env {
            name  = "RUNNER_TEMPLATE_FOLDER"
            value = "/tmp/runner_templates"
          }

          env_from {
            secret_ref {
              name = "mysql-secret"
            }
          }

          env_from {
            secret_ref {
              name = "rabbitmq-secret"
            }
          }

          env_from {
            secret_ref {
              name = "influx-secret"
            }
          }
        }
      }
    }
  }

}
