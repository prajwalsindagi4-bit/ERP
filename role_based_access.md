# Role-Based Access Control (RBAC) Matrix

This document outlines the permissions and access levels for the four core roles within the ERP System. 

## 1. ADMIN
The Admin role has unrestricted, full-system access.
* **Can View:** Dashboard, Customers, Products, Inventory, Challans
* **Can Create:** Customers, Products, Challans
* **Can Edit:** Customers, Products, Challans (Confirm/Cancel)
* **Can Delete:** Customers, Products

## 2. SALES
The Sales role is focused on managing client relationships and outbound orders (Challans).
* **Can View:** Dashboard, Customers, Products, Challans
* **Can Create:** Customers, Challans
* **Can Edit:** Customers, Challans (Confirm/Cancel)
* **Cannot:** Delete any records, Add/Edit Products, Access the Inventory page

## 3. WAREHOUSE
The Warehouse role is focused purely on fulfilling orders and monitoring stock.
* **Can View:** Dashboard, Products, Inventory, Challans
* **Cannot:** Create, Edit, or Delete any records. They have strictly read-only access to track what stock needs to be moved or has been dispatched. They cannot access the Customers page.

## 4. ACCOUNTS
The Accounts role is focused on auditing and financial oversight.
* **Can View:** Dashboard, Customers, Products, Inventory, Challans
* **Cannot:** Create, Edit, or Delete any records. They have strictly read-only access across all modules for auditing purposes.
