import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const dashboardPages = [
  '/dashboard',
  '/battle-plan',
  '/chain-of-command',
  '/chat',
  '/chat-v2',
  '/calendar',
  '/company-scorecard',
  '/export',
  '/fulfillment-machine',
  '/fulfillment-machine-planner',
  '/growth-machine',
  '/growth-machine-planner',
  'hwgt-plan',
  '/innovation-machine',
  '/invite',
  '/meeting-rhythm-planner',
  '/playbook-planner',
  '/profile',
  '/quarterly-sprint-canvas',
  '/sop',
  '/triage-planner',
]

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const isDashboardPage =
    dashboardPages.some((p) => request.nextUrl.pathname.startsWith(p)) ||
    request.nextUrl.pathname.startsWith('/admin')

  if (!session && isDashboardPage) {
    const redirectUrl = new URL('/sign-in', request.url)
    redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (session) {
    const { data: userData } = await supabase
      .from('business_info')
      .select('role, permissions')
      .eq('user_id', session.user.id)
      .single()

    const { data: onboardingData } = await supabase
      .from('company_onboarding')
      .select('completed')
      .eq('user_id', session.user.id)
      .single()

    if (
      !onboardingData?.completed &&
      !request.nextUrl.pathname.startsWith('/onboarding') &&
      !request.nextUrl.pathname.startsWith('/sign-out') &&
      !request.nextUrl.pathname.startsWith('/api') &&
      !request.nextUrl.pathname.startsWith('/admin') &&
      !request.nextUrl.pathname.startsWith('/info')
    ) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }

    if (
      request.nextUrl.pathname.startsWith('/sign-in') ||
      request.nextUrl.pathname.startsWith('/sign-up')
    ) {
    if (userData?.role === 'super_admin') {
        return NextResponse.redirect(new URL('/admin', request.url))
    }
      if (!onboardingData?.completed) {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (request.nextUrl.pathname.startsWith('/admin')) {
      if (userData?.role !== 'super_admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    if (isDashboardPage && userData?.role === 'user') {
      const pageSlug = request.nextUrl.pathname.substring(1).split('/')[0]
      const permissions = userData.permissions as { pages?: string[] } | null
      const allowedPages = permissions?.pages ?? []

      if (pageSlug === 'invite') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }

      const defaultAllowed = ['dashboard', 'profile']
      if (!allowedPages.includes(pageSlug) && !defaultAllowed.includes(pageSlug)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
