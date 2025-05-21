import { Loader2 } from "lucide-react"

export default function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="mt-2 text-sm text-muted-foreground">Loading lunch options...</p>
    </div>
  )
}
