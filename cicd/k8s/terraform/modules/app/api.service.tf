resource "kubernetes_service" "api-service" {
  metadata {
    name      = "api-service"
    namespace = var.namespace
    annotations = {
      "app"       = var.app_name
      "component" = "api-service"
    }
  }

  spec {
    selector = {
      app       = var.app_name
      component = "backend-api"
    }

    port {
      port        = 3000
      target_port = 3000
    }
    type = "LoadBalancer"
  }

}

