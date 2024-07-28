import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"

const Checkbox = React.forwardRef(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={`peer h-4 w-4 shrink-0 rounded-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}>
    <CheckboxPrimitive.Indicator className="flex items-center justify-center">
      <svg className="h-4 w-4" viewBox="0 0 24 24">
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          d="M1.73 12.91l6.37 6.37L22.79 4.59"
        />
      </svg>
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }