"use client"

import { useRef } from "react"

type AutoSubmitFormProps = React.FormHTMLAttributes<HTMLFormElement> & {
  children: React.ReactNode
}

export function AutoSubmitForm({ children, onChange: _ignored, ...rest }: AutoSubmitFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  return (
    <form ref={formRef} onChange={() => formRef.current?.requestSubmit()} {...rest}>
      {children}
    </form>
  )
}
