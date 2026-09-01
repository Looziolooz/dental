'use client'

import { useTransition } from 'react'

import { markPaymentPaid, refundPayment } from '../actions'

export default function PaymentActions({ id, status }: { id: number; status: string }) {
  const [pending, startTransition] = useTransition()

  if (status === 'paid') {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => void refundPayment(id))}
        className="px-3.5 py-1.5 rounded-full border border-neutral-300 text-xs font-semibold hover:border-black transition-colors duration-200 disabled:opacity-40"
      >
        {pending ? '…' : 'Rimborsa'}
      </button>
    )
  }

  if (status === 'pending' || status === 'failed') {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => void markPaymentPaid(id))}
        className="px-3.5 py-1.5 rounded-full bg-black text-white text-xs font-semibold hover:bg-neutral-800 transition-colors duration-200 disabled:opacity-40"
      >
        {pending ? '…' : 'Incassa'}
      </button>
    )
  }

  return null
}
