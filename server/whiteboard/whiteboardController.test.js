const fc = require('fast-check');
const fs = require('fs');
const { saveWhiteboardSnapshot } = require('./whiteboardController');
const { query } = require('../config/postgres');
const path = require('path');

// Mock external dependencies
jest.mock('../config/postgres', () => ({
  query: jest.fn()
}));

// Mock console to keep test output clean
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn()
};

describe('Whiteboard Controller - Property 10', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Property 10: Safe Filename Generation', async () => {
    // Spy on writeFileSync so we don't actually write to disk during fuzzing
    const writeFileSyncSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});

    // For any save request, the generated filename must be a valid UUID with no characters from user-supplied input
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(png|json)$/i;

    await fc.assert(
      fc.asyncProperty(
        fc.string(), // arbitrary format
        fc.string(), // arbitrary data payload
        fc.string(), // arbitrary sessionId
        async (format, data, sessionId) => {
          
          writeFileSyncSpy.mockClear();

          // Set up mock request
          const req = {
            params: { sessionId },
            body: { format, data },
            user: { id: 'test-user-id' }
          };

          // Set up mock response
          const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
          };

          // Mock DB to pretend session always exists and insert works
          query.mockResolvedValue({
            rows: [{ id: 'mock-id', created_at: new Date() }] // the RETURNING results
          });

          await saveWhiteboardSnapshot(req, res);

          // If the request was accepted (meaning it wrote to file)
          // fs.writeFileSync should have been called
          const writeFileSyncCalls = writeFileSyncSpy.mock.calls;

          if (writeFileSyncCalls.length > 0) {
            // There shouldn't be multiple calls per request, just getting the latest one
            const [filePathArg] = writeFileSyncCalls[writeFileSyncCalls.length - 1];
            const parsed = path.parse(filePathArg);
            const filename = parsed.base;

            // Property A: Must match UUID regex + valid extension
            expect(filename).toMatch(uuidRegex);

            // Property B: Must not contain any user-supplied strings directly (except .png or .json)
            // Even if the user provided something weird in data or sessionId, it must not leak into the filename
            if (data.length > 0) {
              expect(filename).not.toContain(data);
            }
            if (sessionId.length > 0) {
              expect(filename).not.toContain(sessionId);
            }
          } else {
             // If fs.writeFileSync was not called, it must have been rejected by input validation
             // Validation correctly drops any format that isn't exactly 'png' or 'json'
             // Or data that exceeds size. That's also safe.
             expect(res.status).toHaveBeenCalledWith(expect.any(Number));
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
