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
