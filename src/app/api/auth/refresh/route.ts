// app/api/auth/refresh/route.js
import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextResponse, NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get('refreshToken')?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as JwtPayload;
    
    // Generate a fresh 15-minute access token
    const newAccessToken = jwt.sign(
      { userId: decoded.userId }, 
      process.env.JWT_SECRET!, 
      { expiresIn: process.env.JWT_LIFETIME || '15m' } as jwt.SignOptions
    );

    // Send the new access token back as a cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
    });

    return response;

  } catch (error) {
    // If the refresh token itself is expired, THEN they must log in again
    return NextResponse.json({ msg: 'Refresh token expired' }, { status: 401 });
  }
}