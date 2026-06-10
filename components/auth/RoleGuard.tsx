import { auth } from "@/auth"
import { BandStreamUserRole } from "@/lib/rbac/roles"
import { hasBandStreamPermission } from "@/lib/rbac/roles"

export async function getRolePermission(requiredRole: BandStreamUserRole) {
    const session = await auth()
    return hasBandStreamPermission(session?.user?.role as BandStreamUserRole | undefined, requiredRole)
}

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole: BandStreamUserRole;
  fallback?: React.ReactNode;
}

export async function RoleGuard({ 
  children, 
  requiredRole, 
  fallback = null 
}: RoleGuardProps) {
    const hasAccess = await getRolePermission(requiredRole)
    if (!hasAccess) {
        return fallback
    }
    return <>{children}</>
} 

// Usage example:
// import { RoleGuard } from '@/components/auth/RoleGuard';

// // Basic usage - hide component if user doesn't have permission
// <RoleGuard requiredRole="ADMIN">
//   <AdminOnlyComponent />
// </RoleGuard>

// // With fallback content
// <RoleGuard 
//   requiredRole="OWNER" 
//   fallback={<p>You need owner permissions to view this content</p>}
// >
//   <OwnerOnlySettings />
// </RoleGuard>

// // Multiple components with different role requirements
// <div>
//   <RoleGuard requiredRole="READER">
//     <PublicContent />
//   </RoleGuard>
  
//   <RoleGuard requiredRole="CUSTOMER">
//     <CustomerFeatures />
//   </RoleGuard>
  
//   <RoleGuard requiredRole="ADMIN">
//     <AdminControls />
//   </RoleGuard>
// </div>