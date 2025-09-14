import { useEffect, useRef } from 'react';
import { queryClient } from '@/lib/queryClient';

interface SSEUpdateEvent {
  openalexId: string;
  updateType: 'profile' | 'sync' | 'create';
  timestamp: string;
}

interface SSEHeartbeatEvent {
  type: 'heartbeat';
  timestamp: string;
}

interface SSEConnectedEvent {
  type: 'connected';
  timestamp: string;
}

type SSEEvent = SSEUpdateEvent | SSEHeartbeatEvent | SSEConnectedEvent;

/**
 * Hook to establish real-time connection for researcher data updates
 * Automatically invalidates React Query cache when backend data changes
 */
export function useRealtimeUpdates() {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000; // Start with 1 second

  const connect = () => {
    // Don't create multiple connections
    if (eventSourceRef.current?.readyState === EventSource.OPEN) {
      return;
    }

    console.log('Establishing SSE connection for real-time updates...');

    try {
      eventSourceRef.current = new EventSource('/api/events');

      eventSourceRef.current.onopen = () => {
        console.log('✅ Real-time updates connected');
        reconnectAttempts.current = 0; // Reset attempts on successful connection
      };

      eventSourceRef.current.onmessage = (event) => {
        try {
          const data: SSEEvent = JSON.parse(event.data);
          
          // Handle different event types
          if ('openalexId' in data) {
            // This is a researcher update event
            console.log(`🔄 Received ${data.updateType} update for researcher:`, data.openalexId);
            
            // Invalidate React Query cache for this specific researcher
            queryClient.invalidateQueries({
              queryKey: [`/api/researcher/${data.openalexId}/data`]
            });
            
            // Also invalidate any related queries
            queryClient.invalidateQueries({
              queryKey: [`/api/researcher`, data.openalexId]
            });
            
            console.log(`✨ Frontend data refreshed for researcher: ${data.openalexId}`);
          } else if (data.type === 'connected') {
            console.log('📡 SSE connection established');
          } else if (data.type === 'heartbeat') {
            // Silent heartbeat to keep connection alive
          }
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      };

      eventSourceRef.current.onerror = (error) => {
        console.warn('❌ SSE connection error:', error);
        
        // Close the current connection
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
        
        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = baseReconnectDelay * Math.pow(2, reconnectAttempts.current);
          console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        } else {
          console.error('🚫 Max reconnection attempts reached. Real-time updates disabled.');
        }
      };
    } catch (error) {
      console.error('Failed to establish SSE connection:', error);
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      console.log('🔌 Disconnecting real-time updates...');
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  useEffect(() => {
    // Establish connection when hook is used
    connect();

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, []);

  // Return connection status and manual control functions
  return {
    isConnected: eventSourceRef.current?.readyState === EventSource.OPEN,
    reconnect: () => {
      disconnect();
      reconnectAttempts.current = 0;
      connect();
    },
    disconnect
  };
}