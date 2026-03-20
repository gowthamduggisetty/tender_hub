// pages/api/filters.js
import { getFilterOptions } from '../../lib/tenderStore'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const filters = await getFilterOptions()
    res.setHeader('Cache-Control', 's-maxage=3600')
    return res.status(200).json(filters)
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch filters.' })
  }
}