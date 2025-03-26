resource "kubernetes_service" "stab-server-service" {
  metadata {
    name      = "stab-server"
    namespace = var.namespace
    labels = {
      app = "stab-server"
    }
  }

  spec {
    selector = {
      app = "stab-server"
    }

    port {
      port        = 3333
      target_port = 3333
      protocol    = "TCP"
    }
    type = "LoadBalancer"
  }

}
