
import express from 'express';

const router = express.Router();

router.post('/', (req, res) => {
  const { message, level = 'info', data } = req.body;
  const timestamp = new Date().toISOString();
  console.log(`[Frontend-Log] ${timestamp} [${level.toUpperCase()}]: ${message}`, data ? JSON.stringify(data) : '');
  res.sendStatus(200);
});

export default router;
