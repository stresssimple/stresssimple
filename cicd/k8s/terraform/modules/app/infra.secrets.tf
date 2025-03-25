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
    RABBITMQ_URI = "amqp://${var.rabbitmq-username}:${var.rabbitmq-password}@${var.rabbitmq-vhost}"
  }
}

#   - INFLUXDB_URL=http://influxdb:8086
#   - INFLUXDB_TOKEN=my-secret-token
#   - INFLUXDB_ORG=my-org
#   - INFLUXDB_BUCKET=test-runs
resource "kubernetes_secret" "influx-secret" {
  metadata {
    name      = "influx-secret"
    namespace = var.namespace
    annotations = {
      app = var.app_name
    }
  }
  data = {
    INFLUXDB_URL    = var.influxdb-uri
    INFLUXDB_TOKEN  = var.influxdb-admin-token
    INFLUXDB_ORG    = var.influxdb-org
    INFLUXDB_BUCKET = var.influxdb-bucket
  }
}
