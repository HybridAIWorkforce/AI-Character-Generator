import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Health check endpoint for Docker and monitoring
 * Returns 200 OK if the application is healthy
 */
export async function GET() {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || 'unknown',
  };

  try {
    // Add any additional health checks here (database, Redis, etc.)
    // Example: await prisma.$queryRaw`SELECT 1`

    return NextResponse.json(healthCheck, { status: 200 });
  } catch (error) {
    healthCheck.status = 'unhealthy';
    
    return NextResponse.json(
      {
        ...healthCheck,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
