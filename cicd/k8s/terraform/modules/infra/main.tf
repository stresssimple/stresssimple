

# resource "helm_release" "mysql" {
#   name              = "mysql"
#   repository        = "bitnami"
#   chart             = "mysql"
#   namespace         = var.namespace
#   timeout           = 600
#   dependency_update = true
#   version           = "12.3.2"
#   values = [
#     file("${path.module}/values/mysql-values.yaml")
#   ]

#   set {
#     name  = "auth.rootPassword"
#     value = var.mysql-root-password
#   }

#   set {
#     name  = "auth.username"
#     value = var.mysql-user-name
#   }

#   set {
#     name  = "auth.password"
#     value = var.mysql-user-password
#   }

#   set {
#     name  = "primary.persistence.enabled"
#     value = "true"
#   }

#   set {
#     name  = "primary.persistence.size"
#     value = "8Gi"
#   }
#   set {
#     name  = "auth.mysqlnativepassword"
#     value = "true"
#   }

#   # initdbScripts:
#   # my_init_script.sh: |
#   #   #!/bin/bash
#   #   if [[ $(hostname) == *primary* ]]; then
#   #     echo "Primary node"
#   #     password_aux="${MYSQL_ROOT_PASSWORD:-}"
#   #     if [[ -f "${MYSQL_ROOT_PASSWORD_FILE:-}" ]]; then
#   #         password_aux=$(cat "$MYSQL_ROOT_PASSWORD_FILE")
#   #     fi
#   #     mysql -P 3306 -uroot -p"$password_aux" -e "create database new_database";
#   #   else
#   #     echo "Secondary node"
#   #   fi
#   set {
#     name  = "auth.database"
#     value = var.mysql-database
#   }

#   set {
#     name  = "auth.createDatabase"
#     value = "true"
#   }
# }


