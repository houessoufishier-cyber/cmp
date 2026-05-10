import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp, FieldValue } from "firebase-admin/firestore";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Firebase Config
const firebaseConfig = JSON.parse(fs.readFileSync(path.join(__dirname, "firebase-applet-config.json"), "utf8"));

// Initialize Firebase Admin
let app;
if (getApps().length === 0) {
  app = initializeApp({
    projectId: firebaseConfig.projectId,
  });
} else {
  app = getApps()[0];
}

const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Campay API Helpers
  let CAMPAY_BASE_URL = (process.env.CAMPAY_BASE_URL?.trim() || "https://www.campay.net/api").replace(/\/+$/, "");
  if (CAMPAY_BASE_URL && !CAMPAY_BASE_URL.startsWith("http")) {
    CAMPAY_BASE_URL = `https://${CAMPAY_BASE_URL}`;
  }
  
  // Validate URL
  try {
    new URL(CAMPAY_BASE_URL);
  } catch (e) {
    console.error("CRITICAL: Invalid CAMPAY_BASE_URL configured:", CAMPAY_BASE_URL);
    CAMPAY_BASE_URL = "https://www.campay.net/api"; // Fallback to default
  }
  
  console.log("Using Campay Base URL:", `"${CAMPAY_BASE_URL}"`);
  const CAMPAY_USERNAME = process.env.CAMPAY_USERNAME;
  const CAMPAY_PASSWORD = process.env.CAMPAY_PASSWORD;

  if (!CAMPAY_USERNAME || !CAMPAY_PASSWORD) {
    console.warn("WARNING: Campay credentials (USERNAME or PASSWORD) are missing from environment variables.");
  }

  async function getCampayToken() {
    console.log("Getting Campay Token...");
    if (!CAMPAY_USERNAME || !CAMPAY_PASSWORD) {
      console.error("Campay Credentials Missing");
      throw new Error("Payment system not configured. Please add CAMPAY_USERNAME and CAMPAY_PASSWORD to your environment variables in the Secrets panel.");
    }

    if (!CAMPAY_BASE_URL) {
      throw new Error("CAMPAY_BASE_URL is not defined");
    }

    console.log("Using Campay Base URL:", CAMPAY_BASE_URL);

    try {
      const response = await axios.post(`${CAMPAY_BASE_URL}/token/`, {
        username: CAMPAY_USERNAME,
        password: CAMPAY_PASSWORD,
      });
      console.log("Campay Token received successfully");
      return response.data.token;
    } catch (error: any) {
      const errorData = error.response?.data;
      const status = error.response?.status;
      const errorMessage = typeof errorData === 'object' ? JSON.stringify(errorData) : errorData || error.message || `Failed to get Campay token (Status: ${status})`;
      console.error(`Campay Token Error (${status}):`, errorMessage);
      
      let userFriendlyError = "Payment system authentication failed. Please check your Campay credentials and Base URL.";
      if (status === 401) {
        userFriendlyError = "Invalid Campay credentials. Please verify your username and password.";
      } else if (status === 404) {
        userFriendlyError = "Campay API endpoint not found. Please verify your CAMPAY_BASE_URL.";
      }
      
      throw new Error(`${userFriendlyError} (Details: ${errorMessage})`);
    }
  }

  // API Routes
  app.post("/api/pay/collect", async (req, res) => {
    const { phoneNumber, amount, userId, plan, type, metadata } = req.body;
    console.log("Collect Request:", { phoneNumber, amount, userId, plan, type });

    if (!phoneNumber || !amount || !userId) {
      console.warn("Collect Request missing fields:", { phoneNumber, amount, userId });
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      console.warn("Invalid amount:", amount);
      return res.status(400).json({ error: "Invalid payment amount" });
    }

    try {
      console.log("Initiating Campay Token retrieval...");
      const token = await getCampayToken();
      
      const campayAmount = Math.floor(Number(amount)).toString();
      console.log(`Initiating Campay Collect request for amount: ${campayAmount} XAF`);
      
      let description = `CampusPlug Payment - ${userId}`;
      if (type === 'UPGRADE') {
        description = `CampusPlug ${plan === 'ACADEMIC_YEAR' ? 'Academic Year' : '30 Days'} Upgrade - ${userId}`;
      } else if (type === 'MARKET_POST') {
        description = `CampusPlug Market Listing Fee - ${userId}`;
      } else if (type === 'HOUSING_POST') {
        description = `CampusPlug Housing Listing Fee - ${userId}`;
      } else if (type === 'ITEM_PURCHASE') {
        description = `CampusPlug Item Purchase: ${metadata?.itemTitle || 'Item'} - ${userId}`;
      }

      // Initiate pull payment
      const response = await axios.post(
        `${CAMPAY_BASE_URL}/collect/`,
        {
          amount: campayAmount, // Ensure integer string
          currency: "XAF",
          from: phoneNumber,
          description: description.substring(0, 100),
          external_reference: userId.substring(0, 100),
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      console.log("Campay Collect Response:", response.data);

      if (!response.data.reference) {
        throw new Error("Campay did not return a transaction reference");
      }

      // Store the pending transaction in Firestore to track it
      console.log("Storing transaction in Firestore:", response.data.reference);
      await db.collection("transactions").doc(response.data.reference).set({
        userId,
        phoneNumber,
        amount,
        plan: plan || null,
        type: type || 'UPGRADE',
        metadata: metadata || {},
        status: 'PENDING',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });

      res.json(response.data);
    } catch (error: any) {
      const errorData = error.response?.data;
      const status = error.response?.status;
      const errorMessage = typeof errorData === 'object' ? JSON.stringify(errorData) : errorData || error.message || "Payment initiation failed";
      console.error(`Campay Collect Error (${status}):`, errorMessage);
      res.status(status || 500).json({ error: errorMessage });
    }
  });

  app.get("/api/pay/status/:reference", async (req, res) => {
    const { reference } = req.params;
    const { userId } = req.query;
    console.log("Status Check Request:", { reference, userId });

    if (!reference) {
      return res.status(400).json({ error: "Missing transaction reference" });
    }

    try {
      console.log(`Checking status for reference: ${reference}`);
      const token = await getCampayToken();
      const response = await axios.get(`${CAMPAY_BASE_URL}/transaction/${reference}/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      console.log("Campay Status Response:", response.data);
      const status = response.data.status; // SUCCESSFUL, FAILED, PENDING

      if (status === "SUCCESSFUL" && userId) {
        console.log(`Payment successful for reference: ${reference}. Processing...`);
        // Get the transaction details to know the type and plan
        const txDoc = await db.collection("transactions").doc(reference).get();
        const txData = txDoc.data();
        const type = txData?.type || 'UPGRADE';
        const plan = txData?.plan || '30_DAYS';

        if (type === 'UPGRADE') {
          console.log(`Upgrading user ${userId} to premium...`);
          // Upgrade user to premium in Firestore
          const userRef = db.collection("users").doc(userId as string);
          const expiryDate = new Date();
          const daysToAdd = plan === 'ACADEMIC_YEAR' ? 365 : 30;
          expiryDate.setDate(expiryDate.getDate() + daysToAdd);

          await userRef.set({
            isPremium: true,
            premiumExpiry: Timestamp.fromDate(expiryDate),
            updatedAt: FieldValue.serverTimestamp(),
          }, { merge: true });
        } else if (type === 'MARKET_POST') {
          console.log(`Market post payment successful for user ${userId}.`);
          // Metadata could contain the item ID if it was pre-created, 
          // but usually we create it after payment success in the frontend.
        }

        // Update transaction status
        await db.collection("transactions").doc(reference).set({
          status: 'SUCCESSFUL',
          updatedAt: FieldValue.serverTimestamp()
        }, { merge: true });
        console.log("Transaction updated to SUCCESSFUL");
      } else if (status === "FAILED") {
        console.log(`Payment failed for reference: ${reference}`);
        await db.collection("transactions").doc(reference).set({
          status: 'FAILED',
          updatedAt: FieldValue.serverTimestamp()
        }, { merge: true });
      }

      res.json(response.data);
    } catch (error: any) {
      const errorData = error.response?.data;
      const status = error.response?.status;
      const errorMessage = typeof errorData === 'object' ? JSON.stringify(errorData) : errorData || error.message || "Failed to check payment status";
      console.error(`Campay Status Error (${status}):`, errorMessage);
      res.status(status || 500).json({ error: errorMessage });
    }
  });

  // Vite middleware for development
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
