import { type InputHTMLAttributes, forwardRef } from 'react'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  id: string
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, id, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={id}
          className="text-sm font-medium text-white/70"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          className={[
            'w-full rounded-xl border bg-ink px-4 py-3 text-sm text-white placeholder-white/25',
            'outline-none transition-all duration-200',
            'focus:border-mint focus:ring-2 focus:ring-mint/20',
            error
              ? 'border-red-500/70 focus:border-red-500 focus:ring-red-500/20'
              : 'border-ink-border',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${id}-error`} className="text-xs text-red-400">
            {error}
          </p>
        )}
      </div>
    )
  },
)

FormField.displayName = 'FormField'
