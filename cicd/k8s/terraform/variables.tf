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
