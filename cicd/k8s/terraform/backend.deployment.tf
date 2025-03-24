resource "kubernetes_deployment" "backend_deployment" {
  metadata {
    name      = "backend-api"
    namespace = var.namespace
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "backend-api"
      }
    }

    template {
      metadata {
        labels = {
          app = "backend-api"
        }
      }

      spec {
        container {
          image = "ghcr.io/stresssimple/backend:latest"
          name  = "backend-api"
          port {
            container_port = 3000
          }
        }
      }
    }
  }

}
