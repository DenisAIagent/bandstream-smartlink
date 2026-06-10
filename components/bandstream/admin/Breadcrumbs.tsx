"use client"

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { useTranslations } from 'next-intl'
import { usePathname } from "next/navigation"
import { Fragment, useEffect, useState } from "react"

export default function AdminBreadcrumbs() {
  const pathname = usePathname()
  const [entityNames, setEntityNames] = useState<Record<string, string>>({})
  
  const pathSegments = pathname.split("/").filter(Boolean)
  const localeSegment = pathSegments[0]
  const segmentsWithoutLocale = pathSegments.slice(1)
  const tbreadcrumb = useTranslations('breadcrumb');
  
  // Function to fetch entity name
  const fetchEntityName = async (type: string, id: string) => {
    try {
      const response = await fetch(`/api/admin/${type}/${id}`)
      const data = await response.json()
      setEntityNames(prev => ({
        ...prev,
        [`${type}-${id}`]: data.name
      }))
    } catch (error) {
      console.error(`Error fetching ${type} name:`, error)
    }
  }

  useEffect(() => {
    segmentsWithoutLocale.forEach((segment, index) => {
      const prevSegment = segmentsWithoutLocale[index - 1]
      if (!isNaN(Number(segment)) && prevSegment) {
        const entityType = prevSegment === "edit" ? segmentsWithoutLocale[index - 2] : prevSegment
        if (!entityNames[`${entityType}-${segment}`]) {
          fetchEntityName(entityType, segment)
        }
      }
    })
  }, [pathname])

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <BreadcrumbList className="flex w-full items-center">
        <Breadcrumb className="flex w-full items-center">
          <BreadcrumbItem>
            <BreadcrumbLink href={`/${localeSegment}/admin`}>{tbreadcrumb('admin')}</BreadcrumbLink>
          </BreadcrumbItem>
          
          {segmentsWithoutLocale.map((segment, index) => {
            if (segment === "admin") return null
            
            const href = `/${localeSegment}/admin/${segmentsWithoutLocale.slice(1, index + 1).join("/")}`
            
            // Check if this segment is an ID and we have a previous segment
            const prevSegment = segmentsWithoutLocale[index - 1]
            const isId = !isNaN(Number(segment))
            
            let text = segment
            if (isId && prevSegment) {
              const entityType = prevSegment === "edit" ? segmentsWithoutLocale[index - 2] : prevSegment
              const key = `${entityType}-${segment}`
              // Show "..." if we don't have the name yet but it's a valid ID that should have a name
              text = entityNames[key] || "..."
            } else {
              text = segment
                .split("-")
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")
            }

            if (['admin', 'bands', 'platforms', 'edit', 'create'].includes(segment)) {
              text = tbreadcrumb(`${segment}`)
            }
            
            return (
              <Fragment key={segment}>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  {segment === "edit" || isId? (
                    <span>{text}</span>
                  ) : (
                    <BreadcrumbLink href={href}>{text}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            )
          })}
        </Breadcrumb>
      </BreadcrumbList>
    </header>
  )
}