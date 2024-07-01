global.console = {
  ...console,
  // uncomment to ignore a specific log level
  log: jest.fn(),
  // debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

process.env.TRAINING_PEAKS_API_URL = "tp-api-base";
process.env.TRAINING_PEAKS_CLIENT_ID = "tp-client-id";
process.env.SUPABASE_URL = "http://test-url";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
