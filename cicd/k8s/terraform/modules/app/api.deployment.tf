resource "kubernetes_deployment" "backend_deployment" {
  metadata {
    name      = "backend-api"
    namespace = var.namespace
    annotations = {
      "app"       = var.app_name
      "component" = "backend-api"
    }
  }


  spec {
    replicas = var.backend-api-replicas

    selector {
      match_labels = {
        app       = var.app_name
        component = "backend-api"
      }
    }

    template {
      metadata {
        labels = {
          app       = var.app_name
          component = "backend-api"
        }
      }

      spec {
        container {
          image             = "ghcr.io/${var.project_id}/backend:${var.backend_version}"
          image_pull_policy = "Always"
          name              = "backend-api"
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
