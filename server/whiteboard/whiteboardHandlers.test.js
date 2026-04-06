const fc = require('fast-check');
const { registerWhiteboardHandlers, StateStore } = require('./whiteboardHandlers');
const { query } = require('../config/postgres');

jest.mock('../config/postgres', () => ({
  query: jest.fn()
}));

// Mock console to avoid clutter test output
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

describe('Whiteboard Handlers - Property 9', () => {
  beforeEach(() => {
    query.mockReset();
  });

  it('Property 9: Server-Side Permission Guard', async () => {
    // For any stroke event from a student when canStudentsDraw === false, 
    // StateStore must not be mutated and no broadcast must occur.

    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }), // sessionId
        fc.string({ minLength: 1 }), // userId (student)
        fc.record({                  // arbitrary stroke
          type: fc.constant('path'),
          id: fc.string()
        }),
        async (sessionId, userId, stroke) => {
          // Clean state
          StateStore.delete(sessionId);
          
          // Set initial state
          StateStore.setPermissions(sessionId, { canStudentsDraw: false });
          StateStore.get(sessionId).strokes = [];

          // Setup socket mock
          const mockEmit = jest.fn();
          const mockTo = jest.fn().mockReturnValue({ emit: mockEmit });
          const mockSocket = {
            userId: userId,
            join: jest.fn(),
            leave: jest.fn(),
            on: jest.fn(),
            emit: jest.fn(),
            to: mockTo
          };
          const mockIo = {
            to: jest.fn().mockReturnValue({ emit: jest.fn() })
          };

          // Mock DB to return a host other than this userId (so the user is a student)
          query.mockResolvedValue({
            rows: [{ instructor_id: 'host-123', university_id: 'uni-123' }]
          });

          registerWhiteboardHandlers(mockSocket, mockIo);

          // Find the whiteboard:stroke handler
          const strokeHandlerCall = mockSocket.on.mock.calls.find(call => call[0] === 'whiteboard:stroke');
          const strokeHandler = strokeHandlerCall[1];

          // Trigger the handler
          await strokeHandler({ sessionId, stroke, userId });

          // Valdations:
          // 1. StateStore must not be mutated with the new stroke
          const currentState = StateStore.get(sessionId);
          expect(currentState.strokes).toHaveLength(0);

          // 2. No broadcast must occur
          expect(mockTo).not.toHaveBeenCalledWith(`whiteboard:${sessionId}`);
          expect(mockEmit).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });
});
