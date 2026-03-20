// pages/api/alert.js
import { addTenderAlert } from '../../lib/tenderStore'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { email, trade, state, plan } = req.body
  if (!email) return res.status(400).json({ error: 'Email is required' })
  try {
    const result = await addTenderAlert({ email, trade, state, plan })
    return res.status(200).json(result)
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
}