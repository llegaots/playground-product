'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Plus, Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { InvestorsTable } from '@/components/investors/InvestorsTable'
import { InvestorDetailDrawer } from '@/components/investors/InvestorDetailDrawer'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import type { Investor, InvestorIntentDaily } from '@prisma/client'

type InvestorWithIntent = Investor & {
  intentScores: InvestorIntentDaily[]
}

export default function InvestorsPage() {
  const router = useRouter()
  const [investors, setInvestors] = useState<InvestorWithIntent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInvestor, setSelectedInvestor] = useState<InvestorWithIntent | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  const [dealFilter, setDealFilter] = useState('')
  const [investorTypeFilter, setInvestorTypeFilter] = useState('')
  const [sortBy, setSortBy] = useState('intentScore')
  const [sortOrder, setSortOrder] = useState('desc')

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: '',
    amountCommitted: '',
    notes: '',
    deal: '',
    source: '',
    investorType: '',
    liquidReady: false,
  })

  const fetchInvestors = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (statusFilter) params.append('status', statusFilter)
      if (sourceFilter) params.append('source', sourceFilter)
      if (dealFilter) params.append('deal', dealFilter)
      if (investorTypeFilter) params.append('investorType', investorTypeFilter)
      params.append('sortBy', sortBy)
      params.append('sortOrder', sortOrder)

      const response = await fetch(`/api/investors?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch investors')
      }

      const data = await response.json()
      setInvestors(data)
    } catch (error) {
      console.error('Error fetching investors:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvestors()
  }, [search, statusFilter, sourceFilter, dealFilter, investorTypeFilter, sortBy, sortOrder])

  const handleCreateInvestor = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/investors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amountCommitted: formData.amountCommitted ? parseFloat(formData.amountCommitted) : null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create investor')
      }

      setShowCreateDialog(false)
      setFormData({
        name: '',
        email: '',
        phone: '',
        status: '',
        amountCommitted: '',
        notes: '',
        deal: '',
        source: '',
        investorType: '',
        liquidReady: false,
      })
      fetchInvestors()
    } catch (error) {
      console.error('Error creating investor:', error)
      alert('Failed to create investor')
    }
  }

  const handleInvestorClick = async (investor: Investor) => {
    try {
      const response = await fetch(`/api/investors/${investor.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch investor details')
      }

      const data = await response.json()
      setSelectedInvestor(data)
    } catch (error) {
      console.error('Error fetching investor details:', error)
    }
  }

  // Get unique values for filters
  const statuses = Array.from(new Set(investors.map((i) => i.status).filter(Boolean)))
  const sources = Array.from(new Set(investors.map((i) => i.source).filter(Boolean)))
  const deals = Array.from(new Set(investors.map((i) => i.deal).filter(Boolean)))
  const investorTypes = Array.from(
    new Set(investors.map((i) => i.investorType).filter(Boolean))
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">Investor CRM</h1>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push('/investors/tracked-links')}
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Tracked Links
              </Button>
              <Button variant="outline" onClick={() => signOut()}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
            <div className="lg:col-span-2">
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
            <Select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
            >
              <option value="">All Sources</option>
              {sources.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
            <Select
              value={dealFilter}
              onChange={(e) => setDealFilter(e.target.value)}
            >
              <option value="">All Deals</option>
              {deals.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="intentScore">Sort by Intent</option>
              <option value="name">Sort by Name</option>
              <option value="createdAt">Sort by Created</option>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {investors.length} investor{investors.length !== 1 ? 's' : ''}
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Investor
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Investor</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateInvestor} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <Input
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount Committed
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.amountCommitted}
                        onChange={(e) =>
                          setFormData({ ...formData, amountCommitted: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Source
                      </label>
                      <Input
                        value={formData.source}
                        onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deal
                      </label>
                      <Input
                        value={formData.deal}
                        onChange={(e) => setFormData({ ...formData, deal: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md text-sm"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Create Investor
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : (
            <InvestorsTable
              investors={investors}
              onRefresh={fetchInvestors}
              onInvestorClick={handleInvestorClick}
            />
          )}
        </div>
      </div>

      {/* Detail Drawer */}
      {selectedInvestor && (
        <InvestorDetailDrawer
          investor={selectedInvestor}
          onClose={() => setSelectedInvestor(null)}
          onUpdate={() => {
            fetchInvestors()
            if (selectedInvestor) {
              handleInvestorClick(selectedInvestor)
            }
          }}
        />
      )}
    </div>
  )
}
