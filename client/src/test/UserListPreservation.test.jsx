/**
 * Preservation Property Tests - Admin User List Real-Time Update
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3**
 * 
 * IMPORTANT: These tests verify that existing functionality remains unchanged
 * 
 * This test suite verifies:
 * 1. WebSocket updates for 'updated' actions work correctly
 * 2. WebSocket updates for 'deleted' actions work correctly
 * 3. 30-second auto-refresh mechanism works correctly
 * 4. Manual page refresh loads user list correctly
 * 5. Search and filter functionality works correctly
 * 
 * Expected Outcome on UNFIXED code: Tests PASS (confirms baseline behavior)
 * Expected Outcome on FIXED code: Tests PASS (confirms no regressions)
 * 
 * NOTE: These are simplified unit tests focusing on core preservation behaviors.
 * They verify that WebSocket handlers and refresh mechanisms work correctly
 * without complex UI interactions.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import UserList from '../pages/admin/UserList';
import React from 'react';

// Mock axios
vi.mock('axios');

// Mock the SocketContext
vi.mock('../context/SocketContext', () => ({
  useSocket: vi.fn(),
}));

// Mock UI components to avoid dependency issues
vi.mock('../components/ui/GlassCard', () => ({
  default: ({ children, className }) => <div className={className}>{children}</div>,
}));

vi.mock('../components/ui/ModernButton', () => ({
  default: ({ children, onClick, ...props }) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
}));

vi.mock('../components/ui/DashboardHeading', () => ({
  default: ({ title }) => <h1>{title}</h1>,
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

describe('Property 2: Preservation - Non-Invite WebSocket Behavior and Manual Refresh', () => {
  let mockSocket;
  let mockUserInfo;
  let testUsers;
  let websocketHandler;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Setup mock user info
    mockUserInfo = {
      token: 'mock-admin-token',
      role: 'admin',
      name: 'Admin User',
    };
    
    // Mock localStorage
    global.localStorage.getItem = vi.fn((key) => {
      if (key === 'userInfo') return JSON.stringify(mockUserInfo);
      return null;
    });

    // Setup test users
    testUsers = [
      {
        _id: 'user1',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        role: 'student',
        isVerified: true,
        createdAt: new Date('2024-01-01'),
      },
      {
        _id: 'user2',
        name: 'Bob Smith',
        email: 'bob@example.com',
        role: 'partner',
        isVerified: true,
        createdAt: new Date('2024-01-02'),
      },
      {
        _id: 'user3',
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        role: 'university',
        isVerified: false,
        createdAt: new Date('2024-01-03'),
      },
    ];

    // Mock socket with event listener tracking
    mockSocket = {
      on: vi.fn((event, handler) => {
        if (event === 'userListUpdate') {
          websocketHandler = handler;
        }
      }),
      off: vi.fn(),
      emit: vi.fn(),
    };

    // Mock axios responses
    axios.get = vi.fn((url) => {
      if (url === '/api/admin/users') {
        return Promise.resolve({ data: { users: [...testUsers] } });
      }
      
      if (url === '/api/admin/universities') {
        return Promise.resolve({ data: [] });
      }
      
      return Promise.reject(new Error('Unknown endpoint'));
    });

    axios.put = vi.fn((url, data) => {
      if (url.includes('/grant-permission')) {
        return Promise.resolve({ data: { message: 'Permission granted' } });
      }
      if (url.includes('/revoke-permission')) {
        return Promise.resolve({ data: { message: 'Permission revoked' } });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('Test Case 1: Update user role via WebSocket - user list updates correctly in real-time', async () => {
    console.log('\n[PRESERVATION TEST] Test Case 1: WebSocket Update Action');
    
    const { useSocket } = await import('../context/SocketContext');
    useSocket.mockReturnValue(mockSocket);

    render(<UserList />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    }, { timeout: 10000 });

    console.log('[TEST] Initial users loaded');

    // Verify WebSocket listener was registered
    expect(mockSocket.on).toHaveBeenCalledWith('userListUpdate', expect.any(Function));
    expect(websocketHandler).toBeDefined();

    // Simulate WebSocket update event
    const updatedUser = {
      ...testUsers[0],
      role: 'admin',
      isVerified: true,
    };

    console.log('[TEST] Simulating WebSocket update event for user:', updatedUser.name);
    
    act(() => {
      websocketHandler({
        action: 'updated',
        user: updatedUser,
        timestamp: new Date(),
      });
    });

    // Wait for UI to update
    await waitFor(() => {
      const roleElements = screen.getAllByText(/admin/i);
      expect(roleElements.length).toBeGreaterThan(0);
    }, { timeout: 10000 });

    console.log('[TEST] ✓ User role updated in UI via WebSocket');
    
    // Verify the updated user is displayed with new role
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    const roleElements = screen.getAllByText(/admin/i);
    expect(roleElements.length).toBeGreaterThan(0);
  }, 15000);

  it('Test Case 2: Delete user via WebSocket - user is removed from list in real-time', async () => {
    console.log('\n[PRESERVATION TEST] Test Case 2: WebSocket Delete Action');
    
    const { useSocket } = await import('../context/SocketContext');
    useSocket.mockReturnValue(mockSocket);

    render(<UserList />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Bob Smith')).toBeInTheDocument();
    }, { timeout: 10000 });

    console.log('[TEST] Initial users loaded, Bob Smith is visible');

    // Verify WebSocket listener was registered
    expect(websocketHandler).toBeDefined();

    // Simulate WebSocket delete event
    const deletedUser = testUsers[1]; // Bob Smith

    console.log('[TEST] Simulating WebSocket delete event for user:', deletedUser.name);
    
    act(() => {
      websocketHandler({
        action: 'deleted',
        user: deletedUser,
        timestamp: new Date(),
      });
    });

    // Wait for UI to update - user should be removed
    await waitFor(() => {
      expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument();
    }, { timeout: 10000 });

    console.log('[TEST] ✓ User removed from UI via WebSocket');
    
    // Verify other users are still present
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
  }, 15000);

  it('Test Case 3: Auto-refresh after 30 seconds - user list refreshes correctly', async () => {
    console.log('\n[PRESERVATION TEST] Test Case 3: 30-Second Auto-Refresh');
    
    const { useSocket } = await import('../context/SocketContext');
    useSocket.mockReturnValue(mockSocket);

    render(<UserList />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    }, { timeout: 10000 });

    const initialCallCount = axios.get.mock.calls.filter(
      call => call[0] === '/api/admin/users'
    ).length;

    console.log('[TEST] Initial fetchUsers() call count:', initialCallCount);

    // Fast-forward time by 30 seconds
    console.log('[TEST] Fast-forwarding time by 30 seconds...');
    
    act(() => {
      vi.advanceTimersByTime(30000);
    });

    // Wait for the auto-refresh to trigger
    await waitFor(() => {
      const newCallCount = axios.get.mock.calls.filter(
        call => call[0] === '/api/admin/users'
      ).length;
      expect(newCallCount).toBeGreaterThan(initialCallCount);
    }, { timeout: 10000 });

    const finalCallCount = axios.get.mock.calls.filter(
      call => call[0] === '/api/admin/users'
    ).length;

    console.log('[TEST] Final fetchUsers() call count:', finalCallCount);
    console.log('[TEST] ✓ Auto-refresh triggered after 30 seconds');
    
    expect(finalCallCount).toBe(initialCallCount + 1);
  }, 15000);

  it('Test Case 4: Manual page refresh - user list loads correctly', async () => {
    console.log('\n[PRESERVATION TEST] Test Case 4: Manual Page Refresh');
    
    const { useSocket } = await import('../context/SocketContext');
    useSocket.mockReturnValue(mockSocket);

    // First render (simulating initial page load)
    const { unmount } = render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    }, { timeout: 10000 });

    console.log('[TEST] Initial page load complete');

    // Unmount component (simulating page navigation away)
    unmount();

    // Re-render component (simulating page refresh/navigation back)
    console.log('[TEST] Simulating page refresh...');
    render(<UserList />);

    // Wait for users to load again
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Bob Smith')).toBeInTheDocument();
      expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
    }, { timeout: 10000 });

    console.log('[TEST] ✓ User list loaded correctly after manual refresh');
    
    // Verify all users are displayed
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    expect(screen.getByText('Bob Smith')).toBeInTheDocument();
    expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
  }, 15000);

  it('Test Case 5: Search functionality - filters users correctly', async () => {
    console.log('\n[PRESERVATION TEST] Test Case 5: Search and Filter Functionality');
    
    const user = userEvent.setup({ delay: null });
    const { useSocket } = await import('../context/SocketContext');
    useSocket.mockReturnValue(mockSocket);

    render(<UserList />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    }, { timeout: 10000 });

    console.log('[TEST] Initial users loaded');

    // Verify all users are visible initially
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    expect(screen.getByText('Bob Smith')).toBeInTheDocument();
    expect(screen.getByText('Charlie Brown')).toBeInTheDocument();

    // Find search input
    const searchInput = screen.getByPlaceholderText(/search name or email/i);
    
    // Test search by name
    console.log('[TEST] Testing search by name: "Alice"');
    await user.type(searchInput, 'Alice');

    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument();
      expect(screen.queryByText('Charlie Brown')).not.toBeInTheDocument();
    }, { timeout: 10000 });

    console.log('[TEST] ✓ Search by name works correctly');

    // Clear search
    await user.clear(searchInput);

    // Wait for all users to be visible again
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Bob Smith')).toBeInTheDocument();
      expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
    }, { timeout: 10000 });

    // Test search by email
    console.log('[TEST] Testing search by email: "bob@"');
    await user.type(searchInput, 'bob@');

    await waitFor(() => {
      expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
      expect(screen.getByText('Bob Smith')).toBeInTheDocument();
      expect(screen.queryByText('Charlie Brown')).not.toBeInTheDocument();
    }, { timeout: 10000 });

    console.log('[TEST] ✓ Search by email works correctly');
  }, 20000);

  it('Test Case 6: Role filter - filters users by role correctly', async () => {
    console.log('\n[PRESERVATION TEST] Test Case 6: Role Filter Functionality');
    
    const user = userEvent.setup({ delay: null });
    const { useSocket } = await import('../context/SocketContext');
    useSocket.mockReturnValue(mockSocket);

    render(<UserList />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    }, { timeout: 10000 });

    console.log('[TEST] Initial users loaded');

    // Open filters
    const filterButton = screen.getByRole('button', { name: /more filters/i });
    await user.click(filterButton);

    await waitFor(() => {
      expect(screen.getByText(/role/i)).toBeInTheDocument();
    }, { timeout: 10000 });

    console.log('[TEST] Filters panel opened');

    // Find role filter dropdown
    const roleSelects = screen.getAllByRole('combobox');
    const roleSelect = roleSelects.find(select => 
      select.querySelector('option[value="student"]')
    );

    expect(roleSelect).toBeDefined();

    // Filter by student role
    console.log('[TEST] Filtering by role: student');
    await user.selectOptions(roleSelect, 'student');

    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument();
      expect(screen.queryByText('Charlie Brown')).not.toBeInTheDocument();
    }, { timeout: 10000 });

    console.log('[TEST] ✓ Role filter works correctly');

    // Filter by partner role
    console.log('[TEST] Filtering by role: partner');
    await user.selectOptions(roleSelect, 'partner');

    await waitFor(() => {
      expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
      expect(screen.getByText('Bob Smith')).toBeInTheDocument();
      expect(screen.queryByText('Charlie Brown')).not.toBeInTheDocument();
    }, { timeout: 10000 });

    console.log('[TEST] ✓ Role filter updates correctly');
  }, 20000);

  it('Test Case 7: Verification status filter - filters users by verification status', async () => {
    console.log('\n[PRESERVATION TEST] Test Case 7: Verification Status Filter');
    
    const user = userEvent.setup({ delay: null });
    const { useSocket } = await import('../context/SocketContext');
    useSocket.mockReturnValue(mockSocket);

    render(<UserList />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    }, { timeout: 10000 });

    console.log('[TEST] Initial users loaded');

    // Open filters
    const filterButton = screen.getByRole('button', { name: /more filters/i });
    await user.click(filterButton);

    await waitFor(() => {
      expect(screen.getByText(/verification status/i)).toBeInTheDocument();
    }, { timeout: 10000 });

    // Find verification status filter dropdown
    const statusSelects = screen.getAllByRole('combobox');
    const statusSelect = statusSelects.find(select => 
      select.querySelector('option[value="verified"]')
    );

    expect(statusSelect).toBeDefined();

    // Filter by verified users only
    console.log('[TEST] Filtering by status: verified');
    await user.selectOptions(statusSelect, 'verified');

    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Bob Smith')).toBeInTheDocument();
      expect(screen.queryByText('Charlie Brown')).not.toBeInTheDocument();
    }, { timeout: 10000 });

    console.log('[TEST] ✓ Verification status filter works correctly');

    // Filter by pending users only
    console.log('[TEST] Filtering by status: pending');
    await user.selectOptions(statusSelect, 'pending');

    await waitFor(() => {
      expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
      expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument();
      expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
    }, { timeout: 10000 });

    console.log('[TEST] ✓ Pending status filter works correctly');
  }, 20000);

  it('Test Case 8: Sort functionality - sorts users correctly', async () => {
    console.log('\n[PRESERVATION TEST] Test Case 8: Sort Functionality');
    
    const user = userEvent.setup({ delay: null });
    const { useSocket } = await import('../context/SocketContext');
    useSocket.mockReturnValue(mockSocket);

    render(<UserList />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    }, { timeout: 10000 });

    console.log('[TEST] Initial users loaded (default sort: newest first)');

    // Open filters
    const filterButton = screen.getByRole('button', { name: /more filters/i });
    await user.click(filterButton);

    await waitFor(() => {
      expect(screen.getByText(/sort by/i)).toBeInTheDocument();
    }, { timeout: 10000 });

    // Find sort dropdown
    const sortSelects = screen.getAllByRole('combobox');
    const sortSelect = sortSelects.find(select => 
      select.querySelector('option[value="name-asc"]')
    );

    expect(sortSelect).toBeDefined();

    // Sort by name ascending
    console.log('[TEST] Sorting by name (A-Z)');
    await user.selectOptions(sortSelect, 'name-asc');

    // Get all user rows
    await waitFor(() => {
      const userRows = screen.getAllByRole('row');
      // First row is header, so skip it
      const dataRows = userRows.slice(1);
      
      // Verify Alice comes before Bob comes before Charlie
      const names = dataRows.map(row => row.textContent);
      const aliceIndex = names.findIndex(text => text.includes('Alice Johnson'));
      const bobIndex = names.findIndex(text => text.includes('Bob Smith'));
      const charlieIndex = names.findIndex(text => text.includes('Charlie Brown'));
      
      expect(aliceIndex).toBeLessThan(bobIndex);
      expect(bobIndex).toBeLessThan(charlieIndex);
    }, { timeout: 10000 });

    console.log('[TEST] ✓ Sort by name (A-Z) works correctly');

    // Sort by name descending
    console.log('[TEST] Sorting by name (Z-A)');
    await user.selectOptions(sortSelect, 'name-desc');

    await waitFor(() => {
      const userRows = screen.getAllByRole('row');
      const dataRows = userRows.slice(1);
      
      // Verify Charlie comes before Bob comes before Alice
      const names = dataRows.map(row => row.textContent);
      const aliceIndex = names.findIndex(text => text.includes('Alice Johnson'));
      const bobIndex = names.findIndex(text => text.includes('Bob Smith'));
      const charlieIndex = names.findIndex(text => text.includes('Charlie Brown'));
      
      expect(charlieIndex).toBeLessThan(bobIndex);
      expect(bobIndex).toBeLessThan(aliceIndex);
    }, { timeout: 10000 });

    console.log('[TEST] ✓ Sort by name (Z-A) works correctly');
  }, 20000);
});
