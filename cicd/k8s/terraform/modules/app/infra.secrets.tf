resource "kubernetes_secret" "mysql-secret" {
  metadata {
    name      = "mysql-secret"
    namespace = var.namespace
    annotations = {
      app = var.app_name
    }
  }
  data = {
    MYSQL_DATABASE = var.mysql-database
    MYSQL_USER     = var.mysql-username
    MYSQL_PASSWORD = var.mysql-password
    MYSQL_HOST     = var.mysql-host
    MYSQL_PORT     = var.mysql-port
  }
}

resource "kubernetes_secret" "rabbitmq-secret" {
  metadata {
    name      = "rabbitmq-secret"
    namespace = var.namespace
    annotations = {
      app = var.app_name
    }
  }
  data = {
    RABBITMQ_USER     = var.rabbitmq-username
    RABBITMQ_PASSWORD = var.rabbitmq-password
    RABBITMQ_VHOST    = var.rabbitmq-vhost
  }
}

resource "kubernetes_secret" "influx-secret" {
  metadata {
    name      = "influx-secret"
    namespace = var.namespace
    annotations = {
      app = var.app_name
    }
  }
  data = {
    INFLUXDB_USER     = var.influxdb-username
    INFLUXDB_PASSWORD = var.influxdb-password
    INFLUXDB_DATABASE = var.influxdb-database
    INFLUXDB_HOST     = var.influxdb-host
    INFLUXDB_PORT     = var.influxdb-port
  }
}
