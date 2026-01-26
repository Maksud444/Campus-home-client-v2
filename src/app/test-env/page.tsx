export default function TestEnvPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Test</h1>
      <div className="space-y-2">
        <p>API URL: <code className="bg-gray-100 px-2 py-1 rounded">{process.env.NEXT_PUBLIC_API_URL || 'NOT SET'}</code></p>
        <p>NextAuth URL: <code className="bg-gray-100 px-2 py-1 rounded">{process.env.NEXTAUTH_URL || 'NOT SET'}</code></p>
        <p>Status: {process.env.NEXT_PUBLIC_API_URL ? '✅ Working' : '❌ Not Working'}</p>
      </div>
    </div>
  )
}
