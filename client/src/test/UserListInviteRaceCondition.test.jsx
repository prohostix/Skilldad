/**
 * Bug Condition Exploration Test - Admin User List Real-Time Update
 * 
 * **Validates: Requirements 2.1, 2.2**
 * 
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists
 * 
 * This test explores the race condition where:
 * 1. Admin invites a new user
 * 2. Backend emits WebSocket event 'userListUpdate' with action='created'
 * 3. Frontend WebSocket listener receives event and updates state
 * 4. POST request completes and calls fetchUsers()
 * 5. fetchUsers() overwrites the WebSocket state update
 * 6. New user is NOT visible in the UI until manual refresh
 * 
 * Expected Outcome on UNFIXED code: Test FAILS (proves bug exists)
 * Expected Outcome on FIXED code: Test PASSES (bug is resolved)
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

describe('Bug Condition Exploration: User List Invite Race Condition', () => {
  let mockSocket;
  let mockUserInfo;
  let existingUsers;
  let newUser;
  let websocketHandler;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
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

    // Setup existing users
    existingUsers = [
      {
        _id: 'user1',
        name: 'Existing User 1',
        email: 'user1@example.com',
        role: 'student',
        isVerified: true,
        createdAt: new Date('2024-01-01'),
      },
      {
        _id: 'user2',
        name: 'Existing User 2',
        email: 'user2@example.com',
        role: 'partner',
        isVerified: true,
        createdAt: new Date('2024-01-02'),
      },
    ];

    // Setup new user that will be invited
    newUser = {
      _id: 'newuser123',
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'student',
      isVerified: true,
      createdAt: new Date(),
    };

    // Mock socket with event listener tracking
    mockSocket = {
      on: vi.fn((event, handler) => {
        console.log('[TEST] Socket.on called for event:', event);
        if (event === 'userListUpdate') {
          websocketHandler = handler;
          console.log('[TEST] WebSocket handler registered for userListUpdate');
        }
      }),
      off: vi.fn(),
      emit: vi.fn(),
    };

    // Mock axios responses
    axios.get = vi.fn((url) => {
      console.log('[TEST] axios.get called:', url);
      
      if (url === '/api/admin/users') {
        // Simulate the race condition:
        // When fetchUsers() is called AFTER the WebSocket update,
        // it returns the list WITHOUT the new user (or with stale data)
        console.log('[TEST] fetchUsers() returning existing users (simulating race condition)');
        return Promise.resolve({ data: { users: existingUsers } });
      }
      
      if (url === '/api/admin/universities') {
        return Promise.resolve({ data: [] });
      }
      
      return Promise.reject(new Error('Unknown endpoint'));
    });

    axios.post = vi.fn((url, data) => {
      console.log('[TEST] axios.post called:', url, data);
      
      if (url === '/api/admin/users/invite') {
        console.log('[TEST] Invite POST request - simulating backend behavior');
        
        // Simulate backend behavior: emit WebSocket event BEFORE returning response
        setTimeout(() => {
          console.log('[TEST] Backend emits WebSocket event userListUpdate');
          if (websocketHandler) {
            console.log('[TEST] Calling WebSocket handler with new user');
            websocketHandler({
              action: 'created',
              user: newUser,
              timestamp: new Date(),
            });
            console.log('[TEST] WebSocket handler called - state should be updated');
          }
        }, 50); // Small delay to simulate network timing
        
        // Return success response after a delay (simulating POST completion)
        return new Promise((resolve) => {
          setTimeout(() => {
            console.log('[TEST] POST request completing - returning success');
            resolve({
              data: {
                message: 'User invited successfully',
                user: newUser,
              },
            });
          }, 100);
        });
      }
      
      return Promise.reject(new Error('Unknown endpoint'));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Property 1: Race Condition Between WebSocket and Manual Fetch - should demonstrate bug on unfixed code', async () => {
    console.log('\n========================================');
    console.log('STARTING BUG CONDITION EXPLORATION TEST');
    console.log('========================================\n');
    
    const user = userEvent.setup();

    // Import and setup the mock
    const { useSocket } = await import('../context/SocketContext');
    useSocket.mockReturnValue(mockSocket);

    // Render the UserList component with mock socket
    const { container } = render(<UserList />);

    console.log('[TEST] Component rendered, waiting for initial load');

    // Wait for initial users to load
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        '/api/admin/users',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-admin-token',
          }),
        })
      );
    });

    console.log('[TEST] Initial users loaded');
    console.log('[TEST] Existing users in list:', existingUsers.length);

    // Verify WebSocket listener was registered
    expect(mockSocket.on).toHaveBeenCalledWith('userListUpdate', expect.any(Function));
    console.log('[TEST] ✓ WebSocket listener registered');

    // Open invite modal
    console.log('\n[TEST] Opening invite modal...');
    const inviteButton = screen.getByRole('button', { name: /invite user/i });
    await user.click(inviteButton);

    // Wait for modal to appear
    await waitFor(() => {
      expect(screen.getByText(/invite new user/i)).toBeInTheDocument();
    });
    console.log('[TEST] ✓ Invite modal opened');

    // Fill in the invite form
    console.log('[TEST] Filling invite form...');
    const nameInput = screen.getByPlaceholderText(/enter full name/i);
    const emailInput = screen.getByPlaceholderText(/user@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);

    await user.type(nameInput, newUser.name);
    await user.type(emailInput, newUser.email);
    await user.type(passwordInput, 'TempPassword123');
    console.log('[TEST] ✓ Form filled with user data');

    // Track axios.get call count before submission
    const getCallCountBefore = axios.get.mock.calls.filter(
      call => call[0] === '/api/admin/users'
    ).length;
    console.log('[TEST] fetchUsers() call count before invite:', getCallCountBefore);

    // Submit the form
    console.log('\n[TEST] Submitting invite form...');
    console.log('[TEST] Expected sequence:');
    console.log('[TEST]   1. POST /api/admin/users/invite');
    console.log('[TEST]   2. Backend emits WebSocket event');
    console.log('[TEST]   3. Frontend receives WebSocket event');
    console.log('[TEST]   4. State updated by WebSocket handler');
    console.log('[TEST]   5. POST completes');
    console.log('[TEST]   6. fetchUsers() called (RACE CONDITION)');
    console.log('[TEST]   7. State overwritten by fetchUsers()');
    console.log('[TEST]   8. New user NOT visible in UI\n');

    const submitButton = screen.getByRole('button', { name: /send invite/i });
    await user.click(submitButton);

    // Wait for POST request to be called
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/api/admin/users/invite',
        expect.objectContaining({
          name: newUser.name,
          email: newUser.email,
        }),
        expect.any(Object)
      );
    });
    console.log('[TEST] ✓ POST request sent');

    // Wait for WebSocket event to be processed
    await waitFor(() => {
      expect(websocketHandler).toBeDefined();
    }, { timeout: 200 });
    console.log('[TEST] ✓ WebSocket event should have been emitted');

    // Wait for POST to complete and fetchUsers() to be called
    await waitFor(() => {
      const getCallCountAfter = axios.get.mock.calls.filter(
        call => call[0] === '/api/admin/users'
      ).length;
      expect(getCallCountAfter).toBeGreaterThan(getCallCountBefore);
    }, { timeout: 500 });
    console.log('[TEST] ✓ fetchUsers() was called after POST completion');

    const getCallCountAfter = axios.get.mock.calls.filter(
      call => call[0] === '/api/admin/users'
    ).length;
    console.log('[TEST] fetchUsers() call count after invite:', getCallCountAfter);
    console.log('[TEST] fetchUsers() was called', getCallCountAfter - getCallCountBefore, 'additional time(s)');

    // Give time for all state updates to settle
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
    });

    console.log('\n[TEST] Checking if new user is visible in UI...');

    // CRITICAL ASSERTION: Check if the new user is visible in the UI
    // On UNFIXED code, this should FAIL because fetchUsers() overwrites the WebSocket update
    const newUserInList = screen.queryByText(newUser.name);
    const newUserEmailInList = screen.queryByText(newUser.email);

    console.log('[TEST] New user name in DOM:', newUserInList ? 'YES' : 'NO');
    console.log('[TEST] New user email in DOM:', newUserEmailInList ? 'YES' : 'NO');

    if (!newUserInList && !newUserEmailInList) {
      console.log('\n[TEST] ❌ BUG CONFIRMED: New user NOT visible in UI');
      console.log('[TEST] Race condition detected:');
      console.log('[TEST]   - WebSocket event was received and processed');
      console.log('[TEST]   - fetchUsers() was called after POST completion');
      console.log('[TEST]   - fetchUsers() overwrote the WebSocket state update');
      console.log('[TEST]   - User "' + newUser.name + '" is NOT visible until manual refresh');
      console.log('\n[TEST] This is the EXPECTED behavior on UNFIXED code');
      console.log('[TEST] The test will now FAIL to document the bug\n');
    } else {
      console.log('\n[TEST] ✓ New user IS visible in UI');
      console.log('[TEST] This suggests the bug may be fixed or the race condition did not occur');
    }

    console.log('========================================');
    console.log('END OF BUG CONDITION EXPLORATION TEST');
    console.log('========================================\n');

    // This assertion should FAIL on unfixed code (proving the bug exists)
    // and PASS on fixed code (proving the bug is resolved)
    expect(newUserInList || newUserEmailInList).toBeTruthy();
  });
});
