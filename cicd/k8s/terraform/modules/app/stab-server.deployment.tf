resource "kubernetes_deployment" "stab-server-deployment" {
  metadata {
    name      = "stab-server"
    namespace = var.namespace
    labels = {
      app = "stab-server"
    }
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "stab-server"
      }
    }

    template {
      metadata {
        labels = {
          app = "stab-server"
        }
      }

      spec {
        container {
          image = "ghcr.io/${var.project_id}/stabjs:${var.stab_server_version}"
          name  = "stab-server"

          env {
            name  = "PORT"
            value = "3333"
          }

          env {
            name  = "NODE_ENV"
            value = "production"
          }
        }
      }
    }
  }
}
