import type { SessionUser } from '@/types/user'
import { withQuery } from '@/lib/queries/client'
import { ADMIN_ROLE } from '@/lib/constants'
import { redirectTo, safeRedirectPath } from '@/lib/utils'
import { SignInForm } from './SignInForm'

function SignInPanelBase({ redirect }: { redirect?: string | null }) {
  function handleSuccess(user: SessionUser) {
    const fallback = user.role === ADMIN_ROLE ? '/dashboard' : '/'
    redirectTo(safeRedirectPath(redirect, fallback))
  }
  return <SignInForm onSuccess={handleSuccess} />
}

export const SignInPanel = withQuery(SignInPanelBase)
