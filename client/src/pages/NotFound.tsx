import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <AlertTriangle className="h-16 w-16 text-amber-500 mb-6" />
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <h2 className="text-2xl font-medium mb-4">Page Not Found</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link 
        to="/" 
        className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        Return to Dashboard
      </Link>
    </div>
  )
}