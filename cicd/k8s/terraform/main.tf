terraform {
  required_providers {
    kubernetes = {
      source = "hashicorp/kubernetes",
    }
    helm = {
    }
  }
}


provider "kubernetes" {
  config_path    = "~/.kube/config"
  config_context = var.kube-config-context
}

provider "helm" {
  kubernetes {
    config_path    = "~/.kube/config"
    config_context = var.kube-config-context
    insecure       = true
  }
}

resource "kubernetes_namespace" "kubernetes_namespace" {
  metadata {
    name = var.namespace
  }
}

//Rabbitmq
resource "random_password" "rabbitmq-password" {
  length  = 16
  special = false
  numeric = true
  lower   = true
  upper   = true
}

resource "random_password" "mysql-root-password" {
  length  = 16
  special = false
  numeric = true
  lower   = true
  upper   = true
}

resource "random_password" "mysql-password" {
  length  = 16
  special = false
  numeric = true
  lower   = true
  upper   = true
}

resource "random_password" "influxdb-root-password" {
  length  = 16
  special = false
  numeric = true
  lower   = true
  upper   = true
}

resource "random_password" "influxdb-password" {
  length  = 16
  special = false
  numeric = true
  lower   = true
  upper   = true
}

resource "random_password" "influxdb-admin-token" {
  length  = 32
  special = false
  numeric = true
  lower   = true
  upper   = true

}

module "infra" {
  source              = "./modules/infra"
  rabbitmq-username   = var.rabbitmq-username
  rabbitmq-password   = random_password.rabbitmq-password.result
  mysql-root-password = random_password.mysql-root-password.result
  mysql-user-name     = var.mysql-username
  mysql-user-password = random_password.mysql-password.result
  mysql-database      = var.mysql-username

  influxdb-root-password = random_password.influxdb-root-password.result
  influxdb-password      = random_password.influxdb-password.result
  influxdb-admin-token   = random_password.influxdb-admin-token.result
  influxdb-bucket        = var.influxdb-bucket
  influxdb-org           = var.influxdb-org


  namespace  = var.namespace
  depends_on = [kubernetes_namespace.kubernetes_namespace]
}

module "app" {
  source = "./modules/app"

  app_name       = var.app_name
  mysql-username = var.mysql-username
  mysql-password = random_password.mysql-password.result
  mysql-database = var.mysql-username

  rabbitmq-username = var.rabbitmq-username
  rabbitmq-password = random_password.rabbitmq-password.result
  rabbitmq-vhost    = var.rabbitmq-vhost

  influxdb-admin-token = random_password.influxdb-admin-token.result
  influxdb-uri         = var.influxdb-uri
  influxdb-org         = var.influxdb-org
  influxdb-bucket      = var.influxdb-bucket

  namespace  = var.namespace
  depends_on = [module.infra]
}
