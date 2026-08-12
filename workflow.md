# Mini ERP + CRM: Daily Workflow

Imagine this application as the digital nervous system for a wholesale/distribution business. It connects the Sales team, the Warehouse team, and Management into one unified system.

## 1. Secure Entry (Authentication)
An employee (like `admin@example.com`) logs into the system. The system verifies their identity and grants them a secure "key" (token) that allows them to access the company data.

## 2. The Command Center (Dashboard)
Upon logging in, the employee lands on the Dashboard. This is a real-time overview of the business. They can instantly see:
* How many products are critically low on stock.
* Total registered customers.
* Recent Challans (delivery notes) and whether they are pending or confirmed.

## 3. Managing People (CRM / Customers)
The Sales team can navigate to the **Customers** tab. Here, they can add new clients, search through existing ones, and keep track of contact information.

## 4. Managing Stuff (Products & Inventory)
The Warehouse team uses the **Products** tab to add new items to the catalog and set their prices and SKUs. 
More importantly, they use the **Inventory** tab to track the exact quantity of items in the warehouse. They can manually log when new stock arrives (IN) or is thrown away due to damage (OUT).

## 5. The Magic Step: Challans (Order Fulfillment)
When a customer wants to buy items, an employee creates a **Challan** (a delivery note). 
* **Drafting:** They select the customer, add products to the Challan, and specify quantities. At this stage, it's just a "Draft".
* **Confirming:** When the truck is ready to leave, the employee clicks "Confirm". **This is where the magic happens:** The system automatically checks if there is enough stock in the warehouse. If there is, it deducts those items from the warehouse inventory and permanently logs a record saying *"10 Laptops were removed because of Challan #CH-2026-000001"*. 
* **Canceling:** If the order falls through, canceling the Challan automatically returns the items to the warehouse inventory.
