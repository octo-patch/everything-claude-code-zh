const assert = require('assert');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', '..');
const config = JSON.parse(fs.readFileSync(path.join(root, '.opencode/opencode.json'), 'utf8'));
const readme = fs.readFileSync(path.join(root, '.opencode/README.md'), 'utf8');
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    failed++;
    console.error(`  ✗ ${name}: ${error.message}`);
  }
}

for (const [region, host] of [['global', 'api.minimax.io'], ['cn', 'api.minimaxi.com']]) {
  const provider = config.provider[`minimax-${region}-openai`];
  test(`${region}: Flash first, M3 second, legacy selector retained`, () => {
    assert.deepStrictEqual(Object.keys(provider.models), ['MiniMax-M3.1-Flash', 'MiniMax-M3', 'MiniMax-M2.7']);
    assert.strictEqual(provider.models['MiniMax-M3'].name, 'MiniMax-M3');
    assert.strictEqual(provider.models['MiniMax-M2.7'].name, 'MiniMax-M2.7');
  });
  test(`${region}: shipped connection configuration retains its credential placeholder`, () => {
    assert.strictEqual(provider.npm, '@ai-sdk/openai-compatible');
    assert.deepStrictEqual(provider.env, ['MINIMAX_API_KEY']);
    assert.deepStrictEqual(provider.options, {
      baseURL: `https://${host}/v1`,
      apiKey: '{env:MINIMAX_API_KEY}'
    });
  });
  test(`${region}: Flash capabilities and costs match the API`, () => {
    const flash = provider.models['MiniMax-M3.1-Flash'];
    assert.strictEqual(flash.name, 'MiniMax-M3.1-Flash');
    assert.strictEqual(flash.attachment, true);
    assert.strictEqual(flash.reasoning, true);
    assert.deepStrictEqual(flash.limit, { context: 1000000, output: 524288 });
    assert.deepStrictEqual(flash.cost, { input: 0.15, output: 0.6, cache_read: 0.015 });
    assert.deepStrictEqual(flash.modalities, { input: ['text', 'image', 'video'], output: ['text'] });
    assert.strictEqual(flash.options, undefined);
  });
}

test('existing top-level and agent defaults are retained', () => {
  assert.strictEqual(config.model, 'anthropic/claude-sonnet-4-5');
  assert.strictEqual(config.small_model, 'anthropic/claude-haiku-4-5');
  for (const [name, agent] of Object.entries(config.agent)) {
    assert.strictEqual(agent.model, name === 'build' ? 'anthropic/claude-sonnet-4-5' : 'anthropic/claude-opus-4-5');
  }
});

test('OpenAI-compatible request reaches a credential-free local HTTP mock', () => {
  const provider = config.provider['minimax-global-openai'];
  const completionPath = `${new URL(provider.options.baseURL).pathname}/chat/completions`;
  const mock = `
    const http = require('http');
    const expectedModel = process.argv[1];
    const expectedPath = process.argv[2];
    const expectedAuth = process.argv[3];
    const server = http.createServer((request, response) => {
      let body = '';
      request.on('data', chunk => { body += chunk; });
      request.on('end', () => {
        try {
          const payload = JSON.parse(body);
          if (request.url !== expectedPath || request.headers.authorization !== expectedAuth || payload.model !== expectedModel || payload.messages[0].content !== 'boundary check') {
            throw new Error('mock request did not match the provider boundary');
          }
          response.writeHead(200, { 'content-type': 'application/json' });
          response.end(JSON.stringify({ choices: [{ message: { content: 'ok' } }] }));
          server.close(() => process.exit(0));
        } catch (error) {
          response.writeHead(400);
          response.end(error.message);
          server.close(() => process.exit(1));
        }
      });
    });
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const request = http.request({ hostname: '127.0.0.1', port: address.port, path: expectedPath, method: 'POST', headers: { authorization: expectedAuth, 'content-type': 'application/json' } });
      request.on('error', () => server.close(() => process.exit(1)));
      request.end(JSON.stringify({ model: expectedModel, messages: [{ role: 'user', content: 'boundary check' }] }));
    });
  `;
  execFileSync(process.execPath, ['-e', mock, 'MiniMax-M3.1-Flash', completionPath, 'Bearer test-key'], { encoding: 'utf8', timeout: 5000 });
});

test('opt-in settings example selects Flash without embedding credentials', () => {
  const section = readme.split('## MiniMax Provider Presets')[1];
  const example = JSON.parse(section.match(/```json\n([\s\S]*?)\n```/)[1]);
  assert.strictEqual(example.env.ANTHROPIC_AUTH_TOKEN, '<MINIMAX_API_KEY>');
  assert.strictEqual(example.env.ANTHROPIC_BASE_URL, 'https://api.minimax.io/anthropic');
  for (const key of ['ANTHROPIC_MODEL', 'ANTHROPIC_DEFAULT_SONNET_MODEL', 'ANTHROPIC_DEFAULT_OPUS_MODEL', 'ANTHROPIC_DEFAULT_HAIKU_MODEL']) {
    assert.strictEqual(example.env[key], 'MiniMax-M3.1-Flash');
  }
});

console.log(`\nPassed: ${passed}\nFailed: ${failed}`);
process.exit(failed ? 1 : 0);
