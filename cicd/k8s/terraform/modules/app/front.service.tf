resource "kubernetes_service" "front-service" {
  metadata {
    name      = "front-service"
    namespace = var.namespace
    labels = {
      container = "front"
      app       = var.app_name
    }
    annotations = {
      "metallb.universe.tf/loadBalancerIPs" = "192.168.200.205"
    }
  }

  spec {
    selector = {
      container = "front"
      app       = var.app_name
    }

    port {
      port        = 80
      target_port = 5000
    }
    type = "LoadBalancer"
  }

}
