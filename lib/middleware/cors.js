import Cors from "cors";

export const cors = Cors({
  origin: ["https://yourdomain.com"],
  methods: ["GET", "POST", "OPTIONS"],
});