'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CreateTrackedLinkForm } from '@/components/investors/CreateTrackedLinkForm'
import type { Investor, TrackedLink } from '@prisma/client'

type TrackedLinkWithCount = TrackedLink & {
  investor: Investor | null
  _count: {
    clicks: number
  }
}

export default function TrackedLinksPage() {
  const router = useRouter()
  const [trackedLinks, setTrackedLinks] = useState<TrackedLinkWithCount[]>([])
  const [investors, setInvestors] = useState<Investor[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [linksRes, investorsRes] = await Promise.all([
        fetch('/api/tracked-links'),
        fetch('/api/investors'),
      ])

      if (!linksRes.ok || !investorsRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const [linksData, investorsData] = await Promise.all([
        linksRes.json(),
        investorsRes.json(),
      ])

      setTrackedLinks(linksData)
      setInvestors(investorsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/investors')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Investors
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Tracked Links</h1>
            </div>
            <Button variant="outline" onClick={() => signOut()}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Create Tracked Link</h2>
            <CreateTrackedLinkForm investors={investors} onSuccess={fetchData} />
          </div>

          {/* Links List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Existing Links</h2>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : trackedLinks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No tracked links yet. Create one to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {trackedLinks.map((link) => (
                  <div
                    key={link.id}
                    className="border border-gray-200 rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {link.investor?.name || 'Generic Link'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {link.destinationUrl}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 font-mono">
                          {baseUrl}/t/{link.code}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {link._count.clicks} click{link._count.clicks !== 1 ? 's' : ''}
                      </div>
                    </div>
                    {link.campaign && (
                      <div className="text-xs text-gray-500">
                        Campaign: {link.campaign}
                      </div>
                    )}
                    {link.deal && (
                      <div className="text-xs text-gray-500">Deal: {link.deal}</div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(`${baseUrl}/t/${link.code}`)
                        alert('Copied to clipboard!')
                      }}
                    >
                      Copy URL
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
