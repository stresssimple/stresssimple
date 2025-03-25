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

variable "backend-api-image" {
  description = "The image of the backend API"
  type        = string
  default     = "gcr.io/stresssimple/backend-api:latest"
  validation {
    condition     = length(var.backend-api-image) > 0
    error_message = "The backend-api-image must not be empty"
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
variable "backend-agent-image" {
  description = "The image of the backend worker"
  type        = string
  default     = "gcr.io/stresssimple/backend-agent:latest"
  validation {
    condition     = length(var.backend-agent-image) > 0
    error_message = "The backend-worker-image must not be empty"
  }
}

variable "frontend-image" {
  description = "The image of the frontend"
  type        = string
  default     = "gcr.io/stresssimple/frontend:latest"
  validation {
    condition     = length(var.frontend-image) > 0
    error_message = "The frontend-image must not be empty"
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
  default     = "amqp://rabbitmq"
  validation {
    condition     = length(var.rabbitmq-vhost) > 0
    error_message = "The rabbitmq-vhost must not be empty"
  }
}



variable "influxdb-username" {
  description = "The username for InfluxDB"
  type        = string
  default     = "stress-simple"
  validation {
    condition     = length(var.influxdb-username) > 0
    error_message = "The influxdb-username must not be empty"
  }
}


variable "influxdb-password" {
  description = "The password for InfluxDB"
  type        = string
  validation {
    condition     = length(var.influxdb-password) > 0
    error_message = "The influxdb-password must not be empty"
  }
}

variable "influxdb-database" {
  description = "The database name for InfluxDB"
  type        = string
  default     = "stress-simple"
  validation {
    condition     = length(var.influxdb-database) > 0
    error_message = "The influxdb-database must not be empty"
  }
}

variable "influxdb-host" {
  description = "The host for InfluxDB"
  type        = string
  default     = "influxdb"
  validation {
    condition     = length(var.influxdb-host) > 0
    error_message = "The influxdb-host must not be empty"
  }
}

variable "influxdb-port" {
  description = "The port for InfluxDB"
  type        = number
  default     = 8086
  validation {
    condition     = var.influxdb-port > 0
    error_message = "The influxdb-port must be greater than 0"
  }
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
