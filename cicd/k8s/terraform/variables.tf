variable "app_name" {
  description = "The name of the application"
  type        = string
  default     = "stress-simple"
  validation {
    condition     = length(var.app_name) > 0
    error_message = "The app_name must not be empty"
  }
  validation {
    condition     = length(var.app_name) <= 63
    error_message = "The app_name must not be longer than 63 characters"
  }
}

variable "namespace" {
  description = "The namespace to deploy the application"
  type        = string
  default     = "stress-simple"
  validation {
    condition     = length(var.namespace) > 0
    error_message = "The namespace must not be empty"
  }
  validation {
    condition     = length(var.namespace) <= 63
    error_message = "The namespace must not be longer than 63 characters"
  }
}

//// Rabbitmq
variable "rabbitmq-username" {
  description = "The username for RabbitMQ"
  type        = string
  default     = "stress-simple"
  validation {
    condition     = length(var.rabbitmq-username) > 0
    error_message = "The rabbitmq-username must not be empty"
  }
}

//// Influxdb
variable "influxdb-username" {
  description = "The username for InfluxDB"
  type        = string
  default     = "stress-simple"
  validation {
    condition     = length(var.influxdb-username) > 0
    error_message = "The influxdb-username must not be empty"
  }
}

variable "mysql-username" {
  description = "The username for MySQL"
  type        = string
  default     = "stress-simple"
  validation {
    condition     = length(var.mysql-username) > 0
    error_message = "The mysql-username must not be empty"
  }
}


