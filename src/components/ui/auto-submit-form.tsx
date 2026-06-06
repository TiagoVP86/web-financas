"use client"

import { useRef } from "react"

interface AutoSubmitFormProps {
  children: React.ReactNode
  className?: string
}

export function AutoSubmitForm({ children, className }: AutoSubmitFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  return (
    <form ref={formRef} onChange={() => formRef.current?.requestSubmit()} className={className}>
      {children}
    </form>
  )
}
