import express from "express";
import path from "path";
import fs from "fs/promises";
import jwt from "jsonwebtoken";
import { createServer as createViteServer } from "vite";
import { PRODUCTS } from "./src/data";
import { Product, Order, UserSession } from "./src/types";

// Security encryption keys configuration
const JWT_SECRET = process.env.JWT_SECRET || "anandwan-portal-jwt-secret-key-2026-secure-auth";

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

// Help query, request body, and Authorization parsing safely
function verifyTokenOrEmail(req: any): { email: string; role: string } | null {
  try {
    let token = null;
    const authHeader = req.headers["authorization"];
    const bearerToken = authHeader && authHeader.split(" ")[1];
    
    if (bearerToken) {
      token = bearerToken;
    } else if (req.headers["cookie"]) {
      const cookies = req.headers["cookie"].split(";");
      for (const cookie of cookies) {
        const [key, val] = cookie.trim().split("=");
        if (key === "anandwan_jwt_token") {
          token = decodeURIComponent(val);
          break;
        }
      }
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        return decoded;
      } catch (err) {
        console.warn("Invalid JWT presented to verifyTokenOrEmail:", err);
      }
    }
  } catch (outerErr) {
    console.error("Error reading authorization token or cookie header", outerErr);
  }

  // Backup fallback
  const fallbackEmail = req.query?.requestorEmail || req.body?.requestorEmail;
  if (fallbackEmail) {
    return {
      email: fallbackEmail.toString(),
      role: fallbackEmail.toString().toLowerCase() === "madhurmehare27@gmail.com" ? "admin" : "customer"
    };
  }
  return null;
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

      // Generate a professional signed JWT token
      const token = jwt.sign(
        { email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        ...user,
        token
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Google Auth Endpoint: Constructs the redirect URL
  app.get("/api/auth/google/url", (req, res) => {
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    // If credentials are NOT configured, route to custom interactive sandbox!
    if (!googleClientId || !googleClientSecret) {
      res.json({ url: `${req.protocol}://${req.get("host")}/auth/google/sandbox` });
      return;
    }

    // Real Google Auth URL
    const redirectUri = `${req.protocol}://${req.get("host")}/auth/callback`;
    const params = new URLSearchParams({
      client_id: googleClientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      state: "google-auth",
      access_type: "offline",
      prompt: "consent",
    });
    res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}` });
  });

  // Google OAuth Callback endpoint
  app.get(["/auth/callback", "/auth/callback/"], async (req, res) => {
    const { code } = req.query;
    
    if (!code) {
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Authentication Error</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Inter', sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; background-color: #f8fafc; margin: 0; color: #0f172a; }
            .card { background: white; padding: 2.5rem; border-radius: 1.5rem; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); text-align: center; max-width: 400px; width: 90%; border:1px solid #f1f5f9; border-top: 4px solid #ef4444; }
            .icon { background: #ef4444; color: white; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; font-size: 24px; font-weight: bold; }
            h1 { font-size: 1.35rem; margin-bottom: 0.5rem; color: #1e293b; }
            p { font-size: 0.875rem; color: #64748b; line-height: 1.5; }
            button { margin-top: 1.5rem; background: #64748b; color: white; border: none; padding: 0.625rem 1.25rem; font-weight: 600; border-radius: 0.75rem; cursor: pointer; transition: all 0.2s; }
            button:hover { background: #475569; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">!</div>
            <h1>Authentication Failed</h1>
            <p>Authorization code was missing from the callback url request.</p>
            <button onclick="window.close()">Close Window</button>
          </div>
        </body>
        </html>
      `);
    }

    try {
      const googleClientId = process.env.GOOGLE_CLIENT_ID;
      const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
      
      if (!googleClientId || !googleClientSecret) {
        throw new Error("Google credentials are not set up.");
      }

      const redirectUri = `${req.protocol}://${req.get("host")}/auth/callback`;
      
      // Token Exchange
      const exchangeBody = new URLSearchParams({
        code: code as string,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      });

      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: exchangeBody.toString(),
      });

      if (!tokenResponse.ok) {
        const errDetails = await tokenResponse.text();
        throw new Error("Failed to exchange authentication code with Google: " + errDetails);
      }

      const tokenData = await tokenResponse.json() as any;
      
      // Profile Info
      const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      if (!profileResponse.ok) {
        throw new Error("Failed to load authenticated user profile from Google directory.");
      }

      const profile = await profileResponse.json() as any;
      const email = (profile.email || "").toLowerCase();
      const name = profile.name || email.split("@")[0];

      if (!email) {
        throw new Error("Google account did not provide a valid email profile.");
      }

      // Synchronize database
      const users = await readDb<UserSession[]>(USERS_DB_PATH, defaultUsers);
      let user = users.find((u) => u.email.toLowerCase() === email);

      if (!user) {
        const isMaster = email === "madhurmehare27@gmail.com";
        user = {
          name,
          email,
          phone: "",
          address: "Anandwan Ashram, Warora",
          role: isMaster ? "admin" : "customer",
          smartCoins: 15,
        };
        users.push(user);
        await writeDb(USERS_DB_PATH, users);
      }

      // Sign JWT Session Token
      const token = jwt.sign(
        { email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      const session = {
        ...user,
        token
      };

      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Anandwan Authentication Success</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Inter', sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; background-color: #f8fafc; margin: 0; color: #0f172a; }
            .card { background: white; padding: 2.5rem; border-radius: 1.5rem; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); text-align: center; max-width: 400px; width: 90%; border: 1px solid #f1f5f9; }
            .icon { background: #10b981; color: white; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; font-size: 24px; }
            h1 { font-size: 1.35rem; margin-bottom: 0.5rem; color: #1e293b; }
            p { font-size: 0.875rem; color: #64748b; line-height: 1.5; }
            .spinner { border: 3px solid #f3f3f3; border-top: 3px solid #059669; border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite; margin: 1.5rem auto 0; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">✓</div>
            <h1>Authentication Successful</h1>
            <p>Signing and synchronizing secure cookie session... This window will close automatically.</p>
            <div class="spinner"></div>
          </div>

          <script>
            const session = ${JSON.stringify(session)};
            
            // Set cookie for iframe capability
            const expires = new Date();
            expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000);
            document.cookie = "anandwan_jwt_token=" + encodeURIComponent(session.token) + "; expires=" + expires.toUTCString() + "; path=/; SameSite=None; Secure";

            if (window.opener) {
              window.opener.postMessage({ type: "OAUTH_AUTH_SUCCESS", session: session }, "*");
              setTimeout(() => {
                window.close();
              }, 800);
            } else {
              window.location.href = "/";
            }
          </script>
        </body>
        </html>
      `);
    } catch (err: any) {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Authentication Error</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Inter', sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; background-color: #f8fafc; margin: 0; color: #0f172a; }
            .card { background: white; padding: 2.5rem; border-radius: 1.5rem; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); text-align: center; max-width: 400px; width: 90%; border:1px solid #f1f5f9; border-top: 4px solid #ef4444; }
            .icon { background: #ef4444; color: white; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; font-size: 24px; font-weight: bold; }
            h1 { font-size: 1.35rem; margin-bottom: 0.5rem; color: #1e293b; }
            p { font-size: 0.875rem; color: #64748b; line-height: 1.5; }
            button { margin-top: 1.5rem; background: #64748b; color: white; border: none; padding: 0.625rem 1.25rem; font-weight: 600; border-radius: 0.75rem; cursor: pointer; transition: all 0.2s; }
            button:hover { background: #475569; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">!</div>
            <h1>Authentication Failed</h1>
            <p>${err.message}</p>
            <button onclick="window.close()">Close Window</button>
          </div>
        </body>
        </html>
      `);
    }
  });

  // Google Sandbox endpoint
  app.get("/auth/google/sandbox", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Google Accounts - Sandbox Sign-In</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet font-sans">
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: 'Inter', -apple-system, sans-serif;
            background-color: #f0f4f9;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            color: #1f1f1f;
          }
          .container {
            background-color: #ffffff;
            border-radius: 28px;
            width: 100%;
            max-width: 440px;
            padding: 40px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.08);
            border: 1px solid #e0e2e6;
          }
          .logo {
            display: flex;
            justify-content: center;
            margin-bottom: 24px;
          }
          .logo svg {
            width: 74px;
            height: 24px;
          }
          h1 {
            font-size: 24px;
            font-weight: 400;
            text-align: center;
            margin: 0 0 8px 0;
            color: #1f1f1f;
            letter-spacing: -0.5px;
          }
          .subtitle {
            font-size: 15px;
            color: #444746;
            text-align: center;
            margin: 0 0 28px 0;
          }
          .warning-badge {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            color: #92400e;
            padding: 12px 14px;
            border-radius: 12px;
            font-size: 11px;
            line-height: 1.4;
            margin-bottom: 24px;
            text-align: left;
          }
          .account-list {
            margin-bottom: 24px;
          }
          .account-item {
            display: flex;
            align-items: center;
            padding: 12px 14px;
            border: 1px solid #c4c7c5;
            border-radius: 12px;
            cursor: pointer;
            margin-bottom: 12px;
            transition: all 0.2s ease;
          }
          .account-item:hover {
            background-color: #f7f9fc;
            border-color: #0b57d0;
          }
          .avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background-color: #0b57d0;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 500;
            font-size: 15px;
            margin-right: 12px;
            flex-shrink: 0;
          }
          .avatar.admin {
            background-color: #ca8a04;
          }
          .account-info {
            text-align: left;
            overflow: hidden;
          }
          .account-name {
            font-size: 14px;
            font-weight: 500;
            color: #1f1f1f;
          }
          .account-email {
            font-size: 12px;
            color: #444746;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
          }
          .divider {
            display: flex;
            align-items: center;
            text-align: center;
            color: #747775;
            font-size: 12px;
            margin: 20px 0;
          }
          .divider::before, .divider::after {
            content: '';
            flex: 1;
            border-bottom: 1px solid #e0e2e6;
          }
          .divider:not(:empty)::before { margin-right: .5em; }
          .divider:not(:empty)::after { margin-left: .5em; }
          
          .form-group {
            margin-bottom: 16px;
            text-align: left;
          }
          label {
            display: block;
            font-size: 12px;
            font-weight: 500;
            color: #444746;
            margin-bottom: 6px;
          }
          input {
            width: 100%;
            padding: 12px 16px;
            border: 1px solid #8e918f;
            border-radius: 8px;
            font-size: 14px;
            background-color: transparent;
            color: #1f1f1f;
            outline: none;
            transition: border-color 0.2s;
          }
          input:focus {
            border-color: #0b57d0;
            border-width: 2px;
            padding: 11px 15px;
          }
          .btn-primary {
            width: 100%;
            background-color: #0b57d0;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 100px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s;
            margin-top: 8px;
          }
          .btn-primary:hover {
            background-color: #0842a0;
          }
          .footer-text {
            font-size: 11px;
            color: #747775;
            text-align: center;
            margin-top: 24px;
            line-height: 1.4;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <svg viewBox="0 0 74 24">
              <path fill="#4285F4" d="M12.2 4.9c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.4 1.4 14.9 0 12.2 0 7.5 0 3.4 2.7 1.5 6.7l3.9 3c.9-2.8 3.5-4.8 6.8-4.8z"/>
              <path fill="#EA4335" d="M22.5 12.5c0-.9-.1-1.7-.2-2.5h-10v4.7h5.8c-.3 1.3-.9 2.4-2 3.2L20 21.1c2.2-2 3.5-4.9 3.5-8.6z"/>
              <path fill="#FBBC05" d="M5.4 14.3c-.2-.7-.4-1.5-.4-2.3 0-.8.1-1.6.4-2.3l-3.9-3C.5 8.1 0 10 0 12s.5 3.9 1.5 5.3l3.9-3z"/>
              <path fill="#34A853" d="M12.2 24c3.3 0 6-1.1 8-3l-3.9-3.1c-1.1.7-2.5 1.2-4.1 1.2-3.3 0-5.9-2-6.8-4.8l-3.9 3C3.4 21.3 7.5 24 12.2 24z"/>
            </svg>
          </div>
          <h1>Sign in</h1>
          <p class="subtitle">to continue to Anandwan Smart Portal</p>

          <div class="warning-badge">
            <strong>Sandbox Active:</strong> GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are not set in AI Studio settings yet. Use this interactive screen to simulate a successful Google user login.
          </div>

          <div class="account-list">
            <div class="account-item" onclick="selectDemo('madhurmehare27@gmail.com', 'Madhur Mehare', 'admin')">
              <div class="avatar admin">M</div>
              <div class="account-info">
                <div class="account-name">Madhur Mehare (Admin)</div>
                <div class="account-email">madhurmehare27@gmail.com</div>
              </div>
            </div>

            <div class="account-item" onclick="selectDemo('ananya@example.com', 'Ananya Shinde', 'customer')">
              <div class="avatar">A</div>
              <div class="account-info">
                <div class="account-name">Ananya Shinde (Customer)</div>
                <div class="account-email">ananya@example.com</div>
              </div>
            </div>
          </div>

          <div class="divider">Or use custom profile</div>

          <form id="customForm" onsubmit="submitCustom(event)">
            <div class="form-group">
              <label for="customEmail">Email address</label>
              <input type="email" id="customEmail" placeholder="e.g. yourname@gmail.com" required value="tester@gmail.com" />
            </div>
            <div class="form-group">
              <label for="customName">Full Name</label>
              <input type="text" id="customName" placeholder="e.g. Sam Johnson" required value="Sam Johnson" />
            </div>
            <button type="submit" class="btn-primary">Submit Custom Test Account</button>
          </form>

          <p class="footer-text">
            To use a live production Google account, add your OAuth Client ID and Secret to your AI Studio variable configuration.
          </p>
        </div>

        <script>
          async function completeLogin(email, name, role) {
            try {
              const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email, name: name, mode: role })
              });
              
              if (res.ok) {
                const session = await res.json();
                
                // Set cookie
                const expires = new Date();
                expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000);
                document.cookie = "anandwan_jwt_token=" + encodeURIComponent(session.token) + "; expires=" + expires.toUTCString() + "; path=/; SameSite=None; Secure";

                if (window.opener) {
                  window.opener.postMessage({ type: "OAUTH_AUTH_SUCCESS", session: session }, "*");
                  setTimeout(() => window.close(), 500);
                } else {
                  window.location.href = "/";
                }
              } else {
                alert("Simulated auth database registration failed.");
              }
            } catch (err) {
              alert("Server connection failed during mock completion.");
            }
          }

          function selectDemo(email, name, role) {
            completeLogin(email, name, role);
          }

          function submitCustom(e) {
            e.preventDefault();
            const email = document.getElementById("customEmail").value;
            const name = document.getElementById("customName").value;
            completeLogin(email, name, "customer");
          }
        </script>
      </body>
      </html>
    `);
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

      // Generate signed JWT token
      const token = jwt.sign(
        { email: newUser.email, role: newUser.role, name: newUser.name },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.status(201).json({
        ...newUser,
        token
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // MASTER ROUTER: Fetch all registered users (Master Admin Only)
  app.get("/api/auth/users", async (req, res) => {
    try {
      const auth = verifyTokenOrEmail(req);
      if (!auth || auth.email !== "madhurmehare27@gmail.com") {
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
      const auth = verifyTokenOrEmail(req);
      if (!auth || auth.email !== "madhurmehare27@gmail.com") {
        return res.status(403).json({ error: "Unauthorized: Only Master Admin can authorize administrators." });
      }
      const { email, name, phone, address } = req.body;
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
      const auth = verifyTokenOrEmail(req);
      if (!auth || auth.email !== "madhurmehare27@gmail.com") {
        return res.status(403).json({ error: "Unauthorized" });
      }
      const { targetEmail } = req.body;
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
