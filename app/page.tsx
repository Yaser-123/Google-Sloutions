'use client'

import { useState } from 'react'
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Mock data
const METRIC_CARDS = [
  { label: 'Requests / min', value: '42', trend: '↑ 8%', trendColor: 'text-green-700' },
  { label: 'Flagged messages %', value: '23%', trend: '↓ 3%', trendColor: 'text-red-600' },
  { label: 'PII detections today', value: '17', trend: '↑ 2 new', trendColor: 'text-green-700' },
  { label: 'High risk events', value: '4', trend: '↑ 1 new', trendColor: 'text-red-600' },
]

const LINE_CHART_DATA = [
  { time: '12:37', total: 35, flagged: 7 },
  { time: '12:38', total: 28, flagged: 4 },
  { time: '12:39', total: 40, flagged: 9 },
  { time: '12:40', total: 52, flagged: 14 },
  { time: '12:41', total: 44, flagged: 11 },
  { time: '12:42', total: 38, flagged: 8 },
  { time: '12:43', total: 46, flagged: 12 },
  { time: '12:44', total: 41, flagged: 9 },
  { time: '12:45', total: 50, flagged: 13 },
  { time: '12:46', total: 42, flagged: 10 },
]

const DONUT_DATA = [
  { name: 'Low', value: 54, color: '#639922' },
  { name: 'Medium', value: 31, color: '#ba7517' },
  { name: 'High', value: 15, color: '#e24b4a' },
]

const REQUESTS_DATA = [
  {
    id: 1,
    timestamp: '12:46:51',
    prompt: 'What is the salary range for female en...',
    promptFull: 'What is the salary range for female engineers in India?',
    response: 'The average salary for female enginee...',
    responseFull: 'The average salary for female engineers in India is ₹12-18 LPA, though significant variation exists across companies.',
    flags: ['PII', 'Bias'],
    risk: 'High',
    hasRedact: true,
  },
  {
    id: 2,
    timestamp: '12:46:38',
    prompt: 'Summarize our Q3 revenue report doc',
    promptFull: 'Summarize our Q3 revenue report document',
    response: 'Q3 revenue reached $4.2M, a 12% incr...',
    responseFull: 'Q3 revenue reached $4.2M, a 12% increase year-over-year, driven by enterprise segment growth.',
    flags: [],
    risk: 'Low',
    hasRedact: false,
  },
  {
    id: 3,
    timestamp: '12:45:17',
    prompt: 'My Aadhaar is 7412 8963 1234, is this...',
    promptFull: 'My Aadhaar is 7412 8963 1234, is this valid?',
    response: 'I cannot verify Aadhaar numbers but...',
    responseFull: 'I cannot verify Aadhaar numbers but it appears to be valid format. You should not share sensitive documents.',
    flags: ['PII'],
    risk: 'High',
    hasRedact: true,
  },
  {
    id: 4,
    timestamp: '12:44:02',
    prompt: 'Write a job description for a senior...',
    promptFull: 'Write a job description for a senior role',
    response: 'We are looking for an energetic candi...',
    responseFull: 'We are looking for an energetic candidate with 5+ years experience to join our team.',
    flags: ['Bias'],
    risk: 'Medium',
    hasRedact: false,
  },
  {
    id: 5,
    timestamp: '12:43:50',
    prompt: 'Translate the following paragraph to...',
    promptFull: 'Translate the following paragraph to Spanish',
    response: 'Here is the translation of the provi...',
    responseFull: 'Here is the translation of the provided text from English to Spanish.',
    flags: [],
    risk: 'Low',
    hasRedact: false,
  },
  {
    id: 6,
    timestamp: '12:42:11',
    prompt: 'Account 9876543210 shows an overdraft...',
    promptFull: 'Account 9876543210 shows an overdraft situation',
    response: 'I see the account ending in 3210 has...',
    responseFull: 'I see the account ending in 3210 has negative balance. Please contact support for assistance.',
    flags: ['PII'],
    risk: 'High',
    hasRedact: true,
  },
]

const MODAL_WARNINGS = [
  { type: 'PII', title: 'email', description: 'ravi.sharma@corp.in found in prompt', color: 'border-red-300 bg-red-50' },
  { type: 'PII', title: 'employee ID', description: 'EMP-4821 found in prompt', color: 'border-red-300 bg-red-50' },
  { type: 'Bias', title: 'gender comparison framing', description: 'in prompt', color: 'border-amber-300 bg-amber-50' },
  { type: 'Bias', title: 'salary disparity', description: 'in response lacks contextual caveats', color: 'border-amber-300 bg-amber-50' },
]

function MetricCard({ label, value, trend, trendColor }: any) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <p className="text-xs text-gray-600 font-medium mb-2">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <p className={`text-xs font-medium ${trendColor}`}>{trend}</p>
    </div>
  )
}

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-200 rounded shadow text-xs">
        <p className="text-gray-600">{payload[0].payload.time}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

function CustomLegend({ data }: any) {
  return (
    <div className="flex gap-4 mb-3">
      {data.map((item: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></div>
          <span className="text-xs font-medium text-gray-700">{item.name}</span>
        </div>
      ))}
    </div>
  )
}

function RiskBadge({ risk }: any) {
  const riskConfig: any = {
    Low: 'bg-green-100 text-green-700',
    Medium: 'bg-amber-100 text-amber-700',
    High: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`${riskConfig[risk]} rounded-full text-xs px-2 py-1 font-medium`}>{risk}</span>
  )
}

function FlagBadge({ flag }: any) {
  const flagConfig: any = {
    PII: 'bg-red-100 text-red-700',
    Bias: 'bg-yellow-100 text-yellow-700',
  }
  return (
    <span className={`${flagConfig[flag]} rounded-full text-xs px-2 py-0.5 font-medium`}>{flag}</span>
  )
}

function LogDetailModal({ log, onClose }: any) {
  if (!log) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 m-4" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-xs">← Back</Button>
            <h2 className="font-medium text-gray-900">Request details</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        {/* Prompt & Response */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <p className="text-xs font-medium text-gray-700 mb-2">Prompt</p>
            <div className="font-mono text-xs bg-gray-50 p-3 rounded max-h-28 overflow-y-auto border border-gray-200 text-gray-800">
              {log.promptFull}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-700 mb-2">LLM Response</p>
            <div className="font-mono text-xs bg-gray-50 p-3 rounded max-h-28 overflow-y-auto border border-gray-200 text-gray-800">
              {log.responseFull}
            </div>
          </div>
        </div>

        {/* Risk flags & warnings */}
        <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-white">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-medium text-gray-900">Risk flags & warnings</h3>
            <FlagBadge flag="PII" />
            <FlagBadge flag="Bias" />
            <span className="bg-red-100 text-red-700 rounded-full text-xs px-2 py-1 font-medium">High risk</span>
          </div>
          <div className="space-y-3">
            {MODAL_WARNINGS.map((warning, idx) => (
              <div key={idx} className={`border-l-4 ${warning.color} p-3 rounded`}>
                <div className="flex items-start gap-2">
                  <span className="text-sm font-bold text-gray-900">{warning.type}:</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{warning.title}</p>
                    <p className="text-xs text-gray-600">{warning.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mb-4">
          <Button className="bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 text-sm" variant="outline">
            ✦ Redact PII
          </Button>
          <Button variant="ghost" size="sm" className="text-xs">⬇ Export JSON</Button>
          <Button variant="ghost" size="sm" className="text-xs">⬇ Export CSV</Button>
        </div>

        {/* Metadata */}
        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-700 space-y-1 border border-gray-200">
          <p><span className="font-medium">Request ID:</span> #1847</p>
          <p><span className="font-medium">Timestamp:</span> 2025-07-14 12:46:51 IST</p>
          <p><span className="font-medium">Model:</span> gpt-4o</p>
          <p><span className="font-medium">Latency:</span> 1.34s</p>
          <p><span className="font-medium">Stored:</span> logs/2025-07-14/req-1847.json</p>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [selectedLog, setSelectedLog] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredRequests = REQUESTS_DATA.filter(req =>
    req.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.response.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
            <h1 className="font-bold text-gray-900">Bias & Leak Guard Proxy</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Last updated: 12:47:03 PM</span>
            <Button variant="ghost" size="sm">↻ Refresh</Button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Section 1: Metric Cards */}
        <div className="grid grid-cols-4 gap-3">
          {METRIC_CARDS.map((card, idx) => (
            <MetricCard key={idx} {...card} />
          ))}
        </div>

        {/* Section 2: Charts Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Line Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="font-medium text-gray-900 mb-4">Request volume — last 10 mins</h2>
            <CustomLegend data={[
              { name: 'Total', color: '#2d7a3a' },
              { name: 'Flagged', color: '#e24b4a' },
            ]} />
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={LINE_CHART_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="total" stroke="#2d7a3a" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="flagged" stroke="#e24b4a" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Donut Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="font-medium text-gray-900 mb-4">Risk level breakdown</h2>
            <CustomLegend data={DONUT_DATA} />
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={DONUT_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {DONUT_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section 3: Requests Table */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-gray-900">Recent requests</h2>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search prompts or responses…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-56 text-sm"
              />
              <Button variant="ghost" size="sm">⬇ Export CSV</Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Timestamp</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Prompt</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Response</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Flags</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Risk</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-700 text-xs">{req.timestamp}</td>
                    <td className="py-3 px-4 text-gray-700 text-xs max-w-xs truncate">{req.prompt}</td>
                    <td className="py-3 px-4 text-gray-700 text-xs max-w-xs truncate">{req.response}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        {req.flags.length > 0 ? (
                          req.flags.map((flag, idx) => <FlagBadge key={idx} flag={flag} />)
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <RiskBadge risk={req.risk} />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-6 px-2"
                          onClick={() => setSelectedLog(req)}
                        >
                          View
                        </Button>
                        {req.hasRedact && (
                          <Button variant="ghost" size="sm" className="text-xs h-6 px-2">✦</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  )
}
