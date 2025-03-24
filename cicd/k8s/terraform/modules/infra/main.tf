resource "helm_release" "rabbitmq" {
  atomic     = true
  name       = "rabbit"
  repository = "bitnami"
  chart      = "rabbitmq"
  # version           = "14.1.0"
  version           = "15.4.0"
  namespace         = var.namespace
  dependency_update = true
  timeout           = 600

  values = [
    file("${path.module}/values/rabbitmq-values.yaml")
  ]
  set {
    name  = "auth.username"
    value = var.rabbitmq-username
  }
  set {
    name  = "auth.password"
    value = var.rabbitmq-password
  }

}

resource "helm_release" "mysql" {
  name              = "mysql"
  repository        = "bitnami"
  chart             = "mysql"
  namespace         = var.namespace
  timeout           = 600
  dependency_update = true
  version           = "12.3.2"


  set {
    name  = "auth.rootPassword"
    value = var.mysql-root-password
  }

  set {
    name  = "primary.persistence.enabled"
    value = "true"
  }

  set {
    name  = "primary.persistence.size"
    value = "8Gi"
  }
}


resource "helm_release" "influxdb" {
  name              = "influxdb"
  repository        = "bitnami"
  chart             = "influxdb"
  namespace         = var.namespace
  timeout           = 600
  dependency_update = true
  version           = "6.6.1"

  set {
    name  = "auth.rootPassword"
    value = var.influxdb-root-password
  }

  set {
    name  = "auth.username"
    value = var.influxdb-username
  }

  set {
    name  = "auth.password"
    value = var.influxdb-password
  }

  set {
    name  = "persistence.enabled"
    value = "true"
  }

  set {
    name  = "persistence.size"
    value = "8Gi"
  }

}
