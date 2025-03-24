variable "namespace" {
  type = string
}
variable "rabbitmq-username" {
  type = string
}
variable "rabbitmq-password" {
  type      = string
  sensitive = true
}

variable "mysql-root-password" {
  type      = string
  sensitive = true
}


variable "influxdb-root-password" {
  type      = string
  sensitive = true
}

variable "influxdb-username" {
  type    = string
  default = "stress-simple"
}

variable "influxdb-password" {
  type      = string
  sensitive = true
}

