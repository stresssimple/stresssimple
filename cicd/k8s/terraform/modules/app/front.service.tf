resource "kubernetes_service" "front-service" {
  metadata {
    name      = "front-service"
    namespace = var.namespace
    labels = {
      container = "front"
      app       = var.app_name
    }
  }

  spec {
    selector = {
      container = "front"
      app       = var.app_name
    }

    port {
      port        = 5000
      target_port = 5000
    }
    type = "LoadBalancer"
  }

}
