resource "kubernetes_deployment" "stub-server-deployment" {
  metadata {
    name      = "stub-server"
    namespace = var.namespace
    labels = {
      app = "stub-server"
    }
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "stub-server"
      }
    }

    template {
      metadata {
        labels = {
          app = "stub-server"
        }
      }

      spec {
        container {
          image = "ghcr.io/${var.project_id}/stub-server:${var.stab_server_version}"
          name  = "stub-server"

          env {
            name  = "PORT"
            value = "3333"
          }

          env {
            name  = "NODE_ENV"
            value = "production"
          }
        }
        node_selector = {
          agentpool = "app"
        }
        toleration {
          key      = "kubernetes.azure.com/scalesetpriority"
          operator = "Equal"
          value    = "spot"
          effect   = "NoSchedule"
        }
      }
    }
  }
}
