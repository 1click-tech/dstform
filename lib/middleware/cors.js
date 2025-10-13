import Cors from "cors";

export const cors = Cors({
  origin: ["https://localhost:3000", "https://example.com"],
  methods: ["GET", "POST", "OPTIONS"],
}); 

// Helper method to wait for a middleware to execute before continuing 