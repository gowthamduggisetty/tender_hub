// pages/api/tenders.js
import { getTenders } from '../../lib/tenderStore'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { trade, state, orgType, search, sort } = req.query

  try {
    const data = await getTenders({ trade, state, orgType, search, sort })
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    return res.status(200).json(data)
  } catch (err) {
    console.error('[tenders API error]', err.message)
    return res.status(500).json({ error: 'Failed to fetch tenders.' })
  }
}