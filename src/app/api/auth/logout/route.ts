// app/api/auth/logout/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const cookieStore = await cookies();
  
  // Method 1: Explicitly delete the cookie
  cookieStore.delete('accessToken'); 
  cookieStore.delete('refreshToken'); 

  // Method 2 (Alternative): Overwrite with an expired date to ensure deletion
//   cookieStore.set('token', '', { expires: new Date(0), path: '/' });

  return NextResponse.json({ message: 'Logged out successfully' });
}
