'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import type { Investor } from '@prisma/client'

interface CreateTrackedLinkFormProps {
  investors: Investor[]
  onSuccess: (link: { code: string; destinationUrl: string }) => void
}

export function CreateTrackedLinkForm({
  investors,
  onSuccess,
}: CreateTrackedLinkFormProps) {
  const [investorId, setInvestorId] = useState<string>('')
  const [destinationUrl, setDestinationUrl] = useState('')
  const [campaign, setCampaign] = useState('')
  const [deal, setDeal] = useState('')
  const [loading, setLoading] = useState(false)
  const [createdLink, setCreatedLink] = useState<{ code: string; url: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch('/api/tracked-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          investorId: investorId || null,
          destinationUrl,
          campaign: campaign || null,
          deal: deal || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create tracked link')
      }

      const data = await response.json()
      const baseUrl = window.location.origin
      const fullUrl = `${baseUrl}/t/${data.code}`

      setCreatedLink({ code: data.code, url: fullUrl })
      onSuccess({ code: data.code, destinationUrl })

      // Reset form
      setInvestorId('')
      setDestinationUrl('')
      setCampaign('')
      setDeal('')
    } catch (error) {
      console.error('Error creating tracked link:', error)
      alert('Failed to create tracked link')
    } finally {
      setLoading(false)
    }
  }

  if (createdLink) {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm font-medium text-green-900 mb-2">
            Tracked link created!
          </div>
          <div className="text-sm text-green-700 mb-2">
            <strong>Code:</strong> {createdLink.code}
          </div>
          <div className="text-sm text-green-700 mb-4">
            <strong>Full URL:</strong>
            <div className="mt-1 p-2 bg-white rounded border border-green-300 font-mono text-xs break-all">
              {createdLink.url}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(createdLink.url)
              alert('Copied to clipboard!')
            }}
          >
            Copy URL
          </Button>
        </div>
        <Button
          variant="outline"
          onClick={() => setCreatedLink(null)}
        >
          Create Another
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Investor (optional)
        </label>
        <Select
          value={investorId}
          onChange={(e) => setInvestorId(e.target.value)}
        >
          <option value="">None (generic link)</option>
          {investors.map((inv) => (
            <option key={inv.id} value={inv.id}>
              {inv.name} {inv.email ? `(${inv.email})` : ''}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Destination URL *
        </label>
        <Input
          type="url"
          value={destinationUrl}
          onChange={(e) => setDestinationUrl(e.target.value)}
          placeholder="https://example.com"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Campaign (optional)
        </label>
        <Input
          type="text"
          value={campaign}
          onChange={(e) => setCampaign(e.target.value)}
          placeholder="e.g., Q1 2024 Outreach"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Deal (optional)
        </label>
        <Input
          type="text"
          value={deal}
          onChange={(e) => setDeal(e.target.value)}
          placeholder="e.g., Horizon Park"
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Creating...' : 'Create Tracked Link'}
      </Button>
    </form>
  )
}
