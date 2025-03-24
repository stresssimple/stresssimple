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
  default     = 0
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

variable "influxdb-username" {
  description = "The username for InfluxDB"
  type        = string
  default     = "stress-simple"
  validation {
    condition     = length(var.influxdb-username) > 0
    error_message = "The influxdb-username must not be empty"
  }
}
