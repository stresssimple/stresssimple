resource "kubernetes_deployment" "front-deployment" {
  depends_on = [kubernetes_service.api-service]
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
          image = "ghcr.io/stresssimple/front:1742974424"
          name  = "front"

          port {
            container_port = 5000
            name           = "http"
          }
          env {
            name  = "PORT"
            value = "5000"
          }
          env {
            name  = "PUBLIC_API_URL"
            value = "http://${kubernetes_service.api-service.status[0].load_balancer[0].ingress[0].ip}:${kubernetes_service.api-service.spec[0].port[0].port}"
          }

          env {
            name  = "PUBLIC_API_IP"
            value = kubernetes_service.api-service.status[0].load_balancer[0].ingress[0].ip
          }

          env {
            name  = "PUBLIC_API_PORT"
            value = kubernetes_service.api-service.spec[0].port[0].port
          }
        }
      }
    }
  }
}
