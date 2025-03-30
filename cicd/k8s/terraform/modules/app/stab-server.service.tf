resource "kubernetes_service" "stub-server-service" {
  metadata {
    name      = "stub-server"
    namespace = var.namespace
    labels = {
      app = "stub-server"
    }
  }

  spec {
    selector = {
      app = "stub-server"
    }

    port {
      port        = 3333
      target_port = 3333
      protocol    = "TCP"
    }
    type = "LoadBalancer"
  }

}
