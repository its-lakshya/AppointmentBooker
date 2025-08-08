'use client'
import { FolderPlus, LucideIcon, Plus } from "lucide-react"
import React from "react"
import { Button } from "../ui/button"

type EmptyStateProps = {
  icon?: LucideIcon
  title: string
  message: string
  className?: string
  buttonText?: string
  onClick?: () => void
}

const EmptyState = ({ icon: Icon, title, message, className = "", buttonText, onClick }: EmptyStateProps) => {
  return (
    <div className={`w-full h-full flex items-center justify-center ${className}`}>
      <div className="flex flex-col justify-center items-center text-sm text-center max-w-sm">
        {Icon ?
        <Icon className="mb-2 size-8 text-primary" />
        : <FolderPlus className='mb-2 size-8 text-primary' />
        }
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-muted-foreground mb-4">{message}</p>

        {buttonText && onClick && (
          <Button onClick={onClick}><Plus />{buttonText}</Button>
        )}
      </div>
    </div>
  )
}

export default EmptyState;