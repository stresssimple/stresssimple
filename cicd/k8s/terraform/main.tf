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
  config_path = "~/.kube/config"
}

provider "helm" {
  kubernetes {
    config_path = "~/.kube/config"
    insecure    = true
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


module "infra" {
  source                 = "./modules/infra"
  rabbitmq-username      = var.rabbitmq-username
  rabbitmq-password      = random_password.rabbitmq-password.result
  mysql-root-password    = random_password.mysql-root-password.result
  influxdb-root-password = random_password.influxdb-root-password.result
  influxdb-username      = var.influxdb-username
  influxdb-password      = random_password.influxdb-password.result

  namespace  = var.namespace
  depends_on = [kubernetes_namespace.kubernetes_namespace]
}
