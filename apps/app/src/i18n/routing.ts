"use client";

import NextLink from 'next/link';
import { usePathname as useNextPathname, useRouter as useNextRouter, redirect as useNextRedirect } from 'next/navigation';

export const Link = NextLink;
export const usePathname = useNextPathname;
export const useRouter = useNextRouter;
export const redirect = useNextRedirect;
