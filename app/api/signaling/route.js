import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// In-memory storage for signaling (in production, use Redis or similar)
const connections = new Map();
const rooms = new Map();

export async function GET(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    const userRole = searchParams.get('userRole');

    if (!roomId || !userRole) {
      return NextResponse.json({ error: 'Missing roomId or userRole' }, { status: 400 });
    }

    // Store connection info
    connections.set(userId, { roomId, userRole, timestamp: Date.now() });
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add(userId);

    return NextResponse.json({ 
      success: true, 
      roomId, 
      userRole,
      participants: Array.from(rooms.get(roomId)).length
    });
  } catch (error) {
    console.error('Error in signaling:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { roomId, type, data } = body;

    if (!roomId || !type) {
      return NextResponse.json({ error: 'Missing roomId or type' }, { status: 400 });
    }

    // Get room participants
    const roomParticipants = rooms.get(roomId) || new Set();
    const otherParticipants = Array.from(roomParticipants).filter(id => id !== userId);

    // In a real implementation, you would send this data to other participants via WebSocket
    console.log(`Signaling: ${type} from ${userId} to ${otherParticipants}`, data);

    return NextResponse.json({ 
      success: true, 
      participants: otherParticipants,
      message: `Signal ${type} sent to ${otherParticipants.length} participants`
    });
  } catch (error) {
    console.error('Error in signaling:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const connection = connections.get(userId);
    if (connection) {
      const { roomId } = connection;
      const room = rooms.get(roomId);
      if (room) {
        room.delete(userId);
        if (room.size === 0) {
          rooms.delete(roomId);
        }
      }
      connections.delete(userId);
    }

    return NextResponse.json({ success: true, message: 'Disconnected from room' });
  } catch (error) {
    console.error('Error disconnecting:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

