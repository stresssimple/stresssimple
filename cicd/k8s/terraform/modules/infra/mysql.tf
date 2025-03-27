resource "kubernetes_stateful_set" "mysql-statefulset" {
  metadata {
    name      = "mysql"
    namespace = var.namespace
  }

  spec {
    service_name = "mysql"
    replicas     = 1

    selector {
      match_labels = {
        app = "mysql"
      }
    }

    template {
      metadata {
        labels = {
          app = "mysql"
        }
      }

      spec {
        container {
          image = "mysql:latest"

          name = "mysql"

          env {
            name  = "MYSQL_ROOT_PASSWORD"
            value = var.mysql-root-password
          }

          env {
            name  = "MYSQL_DATABASE"
            value = var.mysql-database
          }

          env {
            name  = "MYSQL_USER"
            value = var.mysql-user-name
          }

          env {
            name  = "MYSQL_PASSWORD"
            value = var.mysql-user-password
          }

          volume_mount {
            name       = "mysql-data"
            mount_path = "/var/lib/mysql"
          }
        }

        volume {
          name = "mysql-data"

          persistent_volume_claim {
            claim_name = "mysql-data"
          }
        }
      }
    }
  }
}



resource "kubernetes_persistent_volume_claim" "mysql-pvc" {
  metadata {
    name      = "mysql-data"
    namespace = var.namespace
  }

  spec {
    access_modes = ["ReadWriteOnce"]
    resources {
      requests = {
        storage = "8Gi"
      }
    }
  }

}

resource "kubernetes_service" "mysql-service" {
  metadata {
    name      = "mysql"
    namespace = var.namespace
  }

  spec {
    selector = {
      app = "mysql"
    }

    port {
      port        = 3306
      target_port = 3306
    }
    type = "LoadBalancer"
  }
}
