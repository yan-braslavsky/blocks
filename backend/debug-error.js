const { createApp } = require('./dist/server.js');
const { errorSchema } = require('./dist/schemas/index.js');

async function testErrorResponse() {
  const app = createApp();
  await app.ready();
  
  // Test with missing prompt
  const response = await app.inject({
    method: 'POST',
    url: '/assistant/query',
    payload: {}
  });
  
  console.log('Status:', response.statusCode);
  console.log('Response body:', JSON.parse(response.body));
  
  const errorResult = errorSchema.safeParse(JSON.parse(response.body));
  console.log('Schema validation result:', errorResult.success);
  if (!errorResult.success) {
    console.log('Validation errors:', errorResult.error.issues);
  }
  
  await app.close();
}

testErrorResponse().catch(console.error);