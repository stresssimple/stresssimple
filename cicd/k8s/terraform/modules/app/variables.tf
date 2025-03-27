variable "project_id" {
  description = "The project ID"
  type        = string
  default     = "stresssimple"
  validation {
    condition     = length(var.project_id) > 0
    error_message = "The project_id must not be empty"
  }
}

variable "stab_server_version" {
  description = "The version of the stab-server"
  type        = string
  default     = "latest"
  validation {
    condition     = length(var.stab_server_version) > 0
    error_message = "The stab_server_version must not be empty"
  }
}

variable "front_version" {
  description = "The version of the front"
  type        = string
  default     = "latest"
  validation {
    condition     = length(var.front_version) > 0
    error_message = "The front_version must not be empty"
  }
}

variable "backend_version" {
  description = "The version of the backend"
  type        = string
  default     = "latest"
  validation {
    condition     = length(var.backend_version) > 0
    error_message = "The backend_version must not be empty"
  }

}

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


variable "backend-api-replicas" {
  description = "The number of replicas for the backend API"
  type        = number
  default     = 1
  validation {
    condition     = var.backend-api-replicas > 0
    error_message = "The backend-api-replicas must be greater than 0"
  }
}

///Agent
///Agent
///Agent
///Agent
variable "backend-agent-replicas" {
  description = "The number of replicas for the backend worker"
  type        = number
  default     = 2
  validation {
    condition     = var.backend-agent-replicas > 0
    error_message = "The backend-agent-replicas must be greater than 0"
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

variable "rabbitmq-password" {
  description = "The password for RabbitMQ"
  type        = string
  validation {
    condition     = length(var.rabbitmq-password) > 0
    error_message = "The rabbitmq-password must not be empty"
  }
}

variable "rabbitmq-vhost" {
  description = "The vhost for RabbitMQ"
  type        = string
  default     = "rabbit-rabbitmq:5672/"
  validation {
    condition     = length(var.rabbitmq-vhost) > 0
    error_message = "The rabbitmq-vhost must not be empty"
  }
}




variable "influxdb-admin-token" {
  type      = string
  sensitive = true

}

variable "influxdb-uri" {
  type    = string
  default = "http://influxdb:8086"


}

variable "influxdb-org" {
  type        = string
  sensitive   = false
  default     = "stress-simple"
  description = "value for the organization"
}

variable "influxdb-bucket" {
  type        = string
  sensitive   = false
  default     = "test-runs"
  description = "value for the bucket"
}


variable "mysql-password" {
  description = "The password for MySQL"
  type        = string
  validation {
    condition     = length(var.mysql-password) > 0
    error_message = "The mysql-password must not be empty"
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

variable "mysql-database" {
  description = "The database name for MySQL"
  type        = string
  default     = "stress-simple"
  validation {
    condition     = length(var.mysql-database) > 0
    error_message = "The mysql-database must not be empty"
  }
}

variable "mysql-host" {
  description = "The host for MySQL"
  type        = string
  default     = "mysql"
  validation {
    condition     = length(var.mysql-host) > 0
    error_message = "The mysql-host must not be empty"
  }
}

variable "mysql-port" {
  description = "The port for MySQL"
  type        = number
  default     = 3306
  validation {
    condition     = var.mysql-port > 0
    error_message = "The mysql-port must be greater than 0"
  }
}
