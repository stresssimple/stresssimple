resource "kubernetes_deployment" "front-deployment" {
  metadata {
    name      = "front-deployment"
    namespace = var.namespace
    labels = {
      container = "front"
      app       = var.app_name
    }
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        container = "front"
        app       = var.app_name
      }
    }

    template {
      metadata {
        name = "front"
        labels = {
          container = "front"
          app       = var.app_name
        }
      }

      spec {
        container {
          image = "ghcr.io/stresssimple/front:1742866885"
          name  = "front"
          port {
            container_port = 5000
            name           = "http"
          }
          env {
            name  = "PORT"
            value = "5000"
          }
        }
      }
    }
  }
}
