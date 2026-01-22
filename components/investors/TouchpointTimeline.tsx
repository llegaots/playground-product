'use client'

import { format } from 'date-fns'
import type { Touchpoint } from '@prisma/client'

interface TouchpointTimelineProps {
  touchpoints: Touchpoint[]
}

const channelLabels: Record<string, string> = {
  LINKEDIN: 'LinkedIn',
  EMAIL: 'Email',
  SMS: 'SMS',
  CALL: 'Call',
  OTHER: 'Other',
}

const typeLabels: Record<string, string> = {
  CONNECTION_SENT: 'Connection Sent',
  CONNECTION_ACCEPTED: 'Connection Accepted',
  DM_SENT: 'DM Sent',
  DM_REPLIED: 'DM Replied',
  PROFILE_VIEWED_MANUAL: 'Profile Viewed',
  POST_ENGAGED_MANUAL: 'Post Engaged',
  LINK_CLICK: 'Link Clicked',
  WEBSITE_VISIT: 'Website Visit',
  CALENDAR_BOOKED: 'Calendar Booked',
  NOTE: 'Note',
}

export function TouchpointTimeline({ touchpoints }: TouchpointTimelineProps) {
  if (touchpoints.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No touchpoints yet. Add one to start tracking engagement.
      </div>
    )
  }

  // Group by date
  const grouped = touchpoints.reduce((acc, tp) => {
    const date = format(new Date(tp.occurredAt), 'yyyy-MM-dd')
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(tp)
    return acc
  }, {} as Record<string, Touchpoint[]>)

  const dates = Object.keys(grouped).sort().reverse()

  return (
    <div className="space-y-6">
      {dates.map((date) => (
        <div key={date}>
          <div className="text-sm font-semibold text-gray-700 mb-3">
            {format(new Date(date), 'MMMM d, yyyy')}
          </div>
          <div className="space-y-2">
            {grouped[date].map((tp) => (
              <div
                key={tp.id}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {typeLabels[tp.type] || tp.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {channelLabels[tp.channel] || tp.channel}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {format(new Date(tp.occurredAt), 'h:mm a')}
                  </div>
                  {tp.metadata && typeof tp.metadata === 'object' && (
                    <div className="text-xs text-gray-600 mt-2">
                      {JSON.stringify(tp.metadata, null, 2)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
