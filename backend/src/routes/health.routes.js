import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({ status: "API running ✅" });
});

export default router;