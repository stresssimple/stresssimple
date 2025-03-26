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
    name  = "auth.admin.token"
    value = var.influxdb-admin-token
  }

  set {
    name  = "auth.admin.org"
    value = var.influxdb-org
  }

  set {
    name  = "auth.admin.bucket"
    value = var.influxdb-bucket
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
