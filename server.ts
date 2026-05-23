import express from "express";
import path from "path";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";
import { PRODUCTS } from "./src/data";
import { Product, Order, UserSession } from "./src/types";

// Setup database file paths in workspace root
const PRODUCTS_DB_PATH = path.join(process.cwd(), "database_products.json");
const ORDERS_DB_PATH = path.join(process.cwd(), "database_orders.json");
const USERS_DB_PATH = path.join(process.cwd(), "database_users.json");

// Helper to safely read files, with fallback initialization
async function readDb<T>(filePath: string, defaultData: T): Promise<T> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content) as T;
  } catch (error) {
    await writeDb(filePath, defaultData);
    return defaultData;
  }
}

async function writeDb<T>(filePath: string, data: T): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Seed default admin and user credentials if DB doesn't exist
  const defaultUsers: UserSession[] = [
    {
      name: "Madhur Mehare",
      email: "madhurmehare27@gmail.com",
      role: "admin",
      smartCoins: 120,
    },
    {
      name: "Ananya Shinde",
      email: "ananya@example.com",
      role: "customer",
      smartCoins: 45,
    }
  ];

  const defaultOrders: Order[] = [
    {
      id: "ORD-8422",
      customerName: "Madhur Mehare",
      customerEmail: "madhurmehare27@gmail.com",
      address: "Anandwan Ashram, Warora",
      items: [
        { productName: "Organic Farm Rich A2 Milk", unit: "500 ml", price: 38, quantity: 2 },
        { productName: "Fresh Artisanal Paneer", unit: "200 g", price: 85, quantity: 1 }
      ],
      subtotal: 161,
      discount: 0,
      total: 190,
      status: "Delivered",
      date: "06:15 AM Today"
    },
    {
      id: "ORD-9110",
      customerName: "Ananya Shinde",
      customerEmail: "ananya@example.com",
      address: "Kothrud, Pune",
      items: [
        { productName: "Pasteurized Sweet Lassi", unit: "250 ml", price: 28, quantity: 3 }
      ],
      subtotal: 84,
      discount: 10,
      total: 103,
      status: "Dispatched",
      date: "14:20 PM Today"
    }
  ];

  // Ensure DB files exist and load up initially
  await readDb<Product[]>(PRODUCTS_DB_PATH, PRODUCTS);
  await readDb<Order[]>(ORDERS_DB_PATH, defaultOrders);
  await readDb<UserSession[]>(USERS_DB_PATH, defaultUsers);

  // --- API ENDPOINTS ---

  // 1. PRODUCTS ROUTER
  app.get("/api/products", async (req, res) => {
    try {
      const items = await readDb<Product[]>(PRODUCTS_DB_PATH, PRODUCTS);
      res.json(items);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const newProduct: Product = req.body;
      const items = await readDb<Product[]>(PRODUCTS_DB_PATH, PRODUCTS);
      
      // Ensure unique ID
      if (!newProduct.id) {
        newProduct.id = "p_" + Date.now();
      }
      
      const updated = [newProduct, ...items];
      await writeDb(PRODUCTS_DB_PATH, updated);
      res.status(201).json(newProduct);
    } catch (e: any) {
      res.status(450).json({ error: e.message });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const items = await readDb<Product[]>(PRODUCTS_DB_PATH, PRODUCTS);
      
      const index = items.findIndex((p) => p.id === id);
      if (index === -1) {
        return res.status(404).json({ error: "Product not found" });
      }

      items[index] = { ...items[index], ...updates };
      await writeDb(PRODUCTS_DB_PATH, items);
      res.json(items[index]);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const items = await readDb<Product[]>(PRODUCTS_DB_PATH, PRODUCTS);
      const filtered = items.filter((p) => p.id !== id);
      await writeDb(PRODUCTS_DB_PATH, filtered);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });


  // 2. ORDERS ROUTER
  app.get("/api/orders", async (req, res) => {
    try {
      const items = await readDb<Order[]>(ORDERS_DB_PATH, defaultOrders);
      res.json(items);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const newOrder: Order = req.body;
      const items = await readDb<Order[]>(ORDERS_DB_PATH, defaultOrders);
      const updated = [newOrder, ...items];
      await writeDb(ORDERS_DB_PATH, updated);

      // Decrement stock levels for purchased quantities automatically on the database!
      const products = await readDb<Product[]>(PRODUCTS_DB_PATH, PRODUCTS);
      newOrder.items.forEach((orderedItem) => {
        const prod = products.find(
          (p) => p.name.toLowerCase() === orderedItem.productName.toLowerCase() || 
                 p.id === (orderedItem as any).productId
        );
        if (prod && prod.stock > 0) {
          prod.stock = Math.max(0, prod.stock - orderedItem.quantity);
        }
      });
      await writeDb(PRODUCTS_DB_PATH, products);

      res.status(201).json(newOrder);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, paymentStatus } = req.body;
      const items = await readDb<Order[]>(ORDERS_DB_PATH, defaultOrders);
      const index = items.findIndex((o) => o.id === id);
      if (index === -1) {
        return res.status(404).json({ error: "Order not found" });
      }

      if (status !== undefined) items[index].status = status;
      if (paymentStatus !== undefined) items[index].paymentStatus = paymentStatus;
      await writeDb(ORDERS_DB_PATH, items);
      res.json(items[index]);
    } catch (e: any) {
      res.status(550).json({ error: e.message });
    }
  });


  // 3. AUTHENTICATION ROUTER
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, name, phone, address, mode } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const users = await readDb<UserSession[]>(USERS_DB_PATH, defaultUsers);
      let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

      // If they are logging in from Admin mode tab, verify they are actually registered as admin
      if (mode === "admin" && (!user || user.role !== "admin")) {
        return res.status(403).json({ error: "Access Denied: This account is not registered as an Admin." });
      }

      if (!user) {
        // Automatically register as a customer if they don't exist yet
        // ONLY the master or seeded users can have admin role. Regular logins default to customer.
        const isMaster = email.toLowerCase() === "madhurmehare27@gmail.com";
        user = {
          name: name || email.split("@")[0],
          email: email.toLowerCase(),
          phone: phone || "",
          address: address || "Anandwan Ashram, Warora",
          role: isMaster ? "admin" : "customer",
          smartCoins: 15,
        };
        users.push(user);
        await writeDb(USERS_DB_PATH, users);
      } else {
        // Dynamic soft updates
        let changed = false;
        if (name && user.name !== name && name !== "Anandwan Admin Hub") { user.name = name; changed = true; }
        if (phone && user.phone !== phone) { user.phone = phone; changed = true; }
        if (address && user.address !== address) { user.address = address; changed = true; }
        
        if (changed) {
          await writeDb(USERS_DB_PATH, users);
        }
      }

      res.json(user);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, name, phone, address } = req.body;
      if (!email || !name) {
        return res.status(400).json({ error: "Missing required details" });
      }

      const users = await readDb<UserSession[]>(USERS_DB_PATH, defaultUsers);
      const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        return res.status(400).json({ error: "Member profile already registered." });
      }

      const isMaster = email.toLowerCase() === "madhurmehare27@gmail.com";
      const finalRole = isMaster ? "admin" : "customer";

      const newUser: UserSession = {
        name,
        email: email.toLowerCase(),
        phone: phone || "",
        address: address || "Anandwan Ashram, Warora",
        role: finalRole,
        smartCoins: 20
      };

      users.push(newUser);
      await writeDb(USERS_DB_PATH, users);
      res.status(201).json(newUser);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // MASTER ROUTER: Fetch all registered users (Master Admin Only)
  app.get("/api/auth/users", async (req, res) => {
    try {
      const { requestorEmail } = req.query;
      if (requestorEmail !== "madhurmehare27@gmail.com") {
        return res.status(403).json({ error: "Unauthorized: Only Master Admin can access this system registry." });
      }

      const users = await readDb<UserSession[]>(USERS_DB_PATH, defaultUsers);
      res.json(users);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // MASTER ROUTER: Create dynamic admin account (Master Admin Only)
  app.post("/api/auth/create-admin", async (req, res) => {
    try {
      const { requestorEmail, email, name, phone, address } = req.body;
      if (requestorEmail !== "madhurmehare27@gmail.com") {
        return res.status(403).json({ error: "Unauthorized: Only Master Admin can authorize administrators." });
      }
      if (!email || !name) {
        return res.status(400).json({ error: "Administrative authority requires a full name and email identifier." });
      }

      const users = await readDb<UserSession[]>(USERS_DB_PATH, defaultUsers);
      const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        exists.role = "admin";
        await writeDb(USERS_DB_PATH, users);
        return res.json({ message: "Existing account authorized as administrator.", user: exists });
      }

      const newAdmin: UserSession = {
        name,
        email: email.toLowerCase(),
        phone: phone || "",
        address: address || "Anandwan Ashram, Warora",
        role: "admin",
        smartCoins: 100
      };

      users.push(newAdmin);
      await writeDb(USERS_DB_PATH, users);
      res.status(201).json(newAdmin);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // MASTER ROUTER: Toggle account administrative permissions (Master Admin Only)
  app.post("/api/auth/toggle-role", async (req, res) => {
    try {
      const { requestorEmail, targetEmail } = req.body;
      if (requestorEmail !== "madhurmehare27@gmail.com") {
        return res.status(403).json({ error: "Unauthorized" });
      }
      if (targetEmail.toLowerCase() === "madhurmehare27@gmail.com") {
        return res.status(400).json({ error: "Security Lock: Master Admin role cannot be modified." });
      }

      const users = await readDb<UserSession[]>(USERS_DB_PATH, defaultUsers);
      const user = users.find((u) => u.email.toLowerCase() === targetEmail.toLowerCase());
      if (!user) {
        return res.status(404).json({ error: "Account could not be found." });
      }

      user.role = user.role === "admin" ? "customer" : "admin";
      await writeDb(USERS_DB_PATH, users);
      res.json(user);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });


  // Vite server integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server executing at http://localhost:${PORT}`);
  });
}

startServer();
