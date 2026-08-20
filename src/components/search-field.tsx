import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type SearchFieldProps = {
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  ariaLabel: string
  className?: string
}

export function SearchField({
  value,
  onValueChange,
  placeholder,
  ariaLabel,
  className,
}: SearchFieldProps) {
  return (
    <div className={cn("relative w-full max-w-2xl", className)}>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        aria-label={ariaLabel}
        className="h-9 pr-10 pl-9"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground"
          aria-label="Limpiar búsqueda"
          onClick={() => onValueChange("")}
        >
          <X />
        </Button>
      )}
    </div>
  )
}
