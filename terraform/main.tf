terraform {
  required_providers {
    azurerm = { source = "hashicorp/azurerm", version = "~> 3.0" }
    helm    = { source = "hashicorp/helm", version = "~> 2.0" }
  }
  backend "azurerm" {
    resource_group_name  = "rg-apppersonal-tfstate"
    storage_account_name = "stcarlosv3state"
    container_name       = "tfstate-apppersonal"
    key                  = "lab21-pro.tfstate"
  }
}

provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
}

resource "azurerm_resource_group" "rg" {
  name     = var.resource_group
  location = var.location
}

# --- REGISTRO Y CLÚSTER ---
resource "azurerm_container_registry" "acr" {
  name                = var.acr_name
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = "Basic"
  admin_enabled       = true
}

resource "azurerm_kubernetes_cluster" "aks" {
  name                = var.aks_name
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  dns_prefix          = "carlospro"
  default_node_pool {
    name       = "default"
    node_count = 1
    vm_size    = "Standard_B2ps_v2"
  }
  identity { type = "SystemAssigned" }
}

resource "azurerm_role_assignment" "aks_acr" {
  principal_id                     = azurerm_kubernetes_cluster.aks.kubelet_identity[0].object_id
  role_definition_name             = "AcrPull"
  scope                            = azurerm_container_registry.acr.id
  skip_service_principal_aad_check = true
}

# --- BASE DE DATOS SQL SERVER ---
resource "azurerm_mssql_server" "sql" {
  name                         = "sql-server-lab21-carlos"
  resource_group_name          = azurerm_resource_group.rg.name
  location                     = azurerm_resource_group.rg.location
  version                      = "12.0"
  administrator_login          = "sqladmin"
  administrator_login_password = "Password1234!" # En producción usar Secrets
}

resource "azurerm_mssql_database" "db" {
  name      = "ticketsdb"
  server_id = azurerm_mssql_server.sql.id
  sku_name  = "S0"
}
###
resource "azurerm_mssql_firewall_rule" "allow_azure" {
  name             = "AllowAzureServices"
  server_id        = azurerm_mssql_server.sql.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# --- API MANAGEMENT (APIM) CON MÉTODOS ---
resource "azurerm_api_management" "apim" {
  name                = var.apim_name
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  publisher_name      = "Carlos Tapia"
  publisher_email     = "admin@carlostapiao.com"
  sku_name            = "Consumption_0"
}

resource "azurerm_api_management_api" "api" {
  name                = "tickets-api"
  resource_group_name = azurerm_resource_group.rg.name
  api_management_name = azurerm_api_management.apim.name
  revision            = "1"
  display_name        = "Tickets API Pro"
  path                = "v1"
  protocols           = ["https"]
  service_url         = "http://lab21-carlos-tickets.${var.location}.cloudapp.azure.com"
}

resource "azurerm_api_management_api_operation" "get" {
  operation_id        = "get-tickets"
  api_name            = azurerm_api_management_api.api.name
  api_management_name = azurerm_api_management.apim.name
  resource_group_name = azurerm_resource_group.rg.name
  display_name        = "Listar Tickets"
  method              = "GET"
  url_template        = "/api/tickets"
}

resource "azurerm_api_management_api_operation" "post" {
  operation_id        = "create-ticket"
  api_name            = azurerm_api_management_api.api.name
  api_management_name = azurerm_api_management.apim.name
  resource_group_name = azurerm_resource_group.rg.name
  display_name        = "Crear Ticket"
  method              = "POST"
  url_template        = "/api/tickets"
}

# --- HELM INGRESS ---
provider "helm" {
  kubernetes {
    host                   = azurerm_kubernetes_cluster.aks.kube_config.0.host
    client_certificate     = base64decode(azurerm_kubernetes_cluster.aks.kube_config.0.client_certificate)
    client_key             = base64decode(azurerm_kubernetes_cluster.aks.kube_config.0.client_key)
    cluster_ca_certificate = base64decode(azurerm_kubernetes_cluster.aks.kube_config.0.cluster_ca_certificate)
  }
}

resource "helm_release" "nginx" {
  name             = "ingress-nginx"
  repository       = "https://kubernetes.github.io/ingress-nginx"
  chart            = "ingress-nginx"
  namespace        = "ingress-basic"
  create_namespace = true
  set {
    name  = "controller.service.annotations.service\\.beta\\.kubernetes\\.io/azure-dns-label-name"
    value = "lab21-carlos-tickets"
  }
}