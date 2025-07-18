import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
  console.log('🧪 [TEST-DELETE] Simple test DELETE handler reached')
  
  return NextResponse.json({
    success: true,
    message: 'Test DELETE working'
  })
} 