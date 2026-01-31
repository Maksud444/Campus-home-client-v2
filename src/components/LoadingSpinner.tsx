export default function LoadingSpinner({ size = 'md', message = 'Loading...' }: { size?: 'sm' | 'md' | 'lg', message?: string }) {
  const sizes = {
    sm: 'h-8 w-8 border-2',
    md: 'h-12 w-12 border-4',
    lg: 'h-16 w-16 border-4'
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className={`animate-spin rounded-full border-primary border-t-transparent ${sizes[size]} mb-4`}></div>
      <p className="text-gray-600">{message}</p>
    </div>
  )
}