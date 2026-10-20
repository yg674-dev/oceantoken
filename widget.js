/* OceanToken site assistant · v1 (preset answers from docs.oceantoken.ai)
 * Embed on any page with one line, before </body>:
 *   <script src="/assistant/widget.js" defer></script>
 * Renders inside a Shadow DOM, so the site's CSS and the widget's CSS can't affect each other.
 * Exposes window.OceanTokenAssistant = { open, close, ask, score, KB } for tests.
 */
(() => {
if (window.OceanTokenAssistant) return;

const CSS = `

  :host {
    --bg: #f6f8fb; --surface: #ffffff; --text: #0f1b2d; --muted: #5b6b80;
    --line: #e2e8f0; --brand: #0b6bcb; --brand-ink: #ffffff; --bubble: #eef4fb;
    --warn-bg: #fff6e5; --warn-line: #f2c879; --shadow: 0 12px 40px rgba(15, 27, 45, .18);
  }
  @media (prefers-color-scheme: dark) {
    :host {
      --bg: #0d1420; --surface: #141d2b; --text: #e6edf6; --muted: #93a3b8;
      --line: #263244; --brand: #4c9cf0; --brand-ink: #06121f; --bubble: #1b2738;
      --warn-bg: #2a2212; --warn-line: #7a5d22; --shadow: 0 12px 40px rgba(0, 0, 0, .5);
    }
  }
  :host { all: initial; font: 16px/1.55 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: var(--text); }
  * { box-sizing: border-box; }
  a { color: var(--brand); }
  /* Launcher */
  .launcher { position: fixed; right: 20px; bottom: 20px; z-index: 2147483000; display: flex; align-items: center; gap: 8px;
    background: var(--brand); color: var(--brand-ink); border: 0; border-radius: 999px; padding: 12px 18px;
    font: 600 15px/1 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; box-shadow: var(--shadow); cursor: pointer; }
  .launcher svg { width: 18px; height: 18px; }
  .launcher[aria-expanded="true"] { display: none; }

  /* Panel */
  .panel { position: fixed; right: 20px; bottom: 20px; z-index: 2147483001; width: 380px; max-width: calc(100vw - 32px);
    height: min(600px, calc(100vh - 40px)); background: var(--surface); border: 1px solid var(--line);
    border-radius: 16px; box-shadow: var(--shadow); display: none; flex-direction: column; overflow: hidden; }
  .panel.open { display: flex; }
  @media (max-width: 520px) {
    .panel { right: 0; bottom: 0; width: 100vw; max-width: 100vw; height: 100dvh; border-radius: 0; }
  }
  .head { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px;
    border-bottom: 1px solid var(--line); }
  .head strong { font-size: 15px; }
  .head small { display: block; color: var(--muted); font-size: 12px; }
  .icon-btn { background: none; border: 0; color: var(--muted); cursor: pointer; padding: 6px; border-radius: 8px; font-size: 20px; line-height: 1; }
  .icon-btn:hover { background: var(--bubble); }

  .log { position: relative; flex: 1; overflow-y: auto; overflow-anchor: none; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
  .msg { max-width: 88%; padding: 10px 12px; border-radius: 12px; font-size: 14.5px; }
  .msg.bot { background: var(--bubble); align-self: flex-start; border-bottom-left-radius: 4px; }
  .msg.user { background: var(--brand); color: var(--brand-ink); align-self: flex-end; border-bottom-right-radius: 4px; }
  .msg.warn { background: var(--warn-bg); border: 1px solid var(--warn-line); }
  .msg p { margin: 0 0 8px; } .msg p:last-child { margin-bottom: 0; }
  .msg ol, .msg ul { margin: 4px 0 8px; padding-left: 20px; }
  .msg code { font: 13px ui-monospace, SFMono-Regular, Menlo, monospace; background: rgba(127,127,127,.15);
    padding: 1px 4px; border-radius: 4px; word-break: break-all; }
  .sources { margin-top: 8px; font-size: 12px; color: var(--muted); }
  .sources a { margin-right: 8px; }
  .typing { color: var(--muted); font-size: 13px; }

  .chips { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 16px 10px; }
  .chip { border: 1px solid var(--line); background: var(--surface); color: var(--text); border-radius: 999px;
    padding: 6px 10px; font-size: 13px; cursor: pointer; }
  .chip:hover { border-color: var(--brand); color: var(--brand); }

  form { display: flex; gap: 8px; padding: 12px 16px; border-top: 1px solid var(--line); }
  input { flex: 1; min-width: 0; border: 1px solid var(--line); background: var(--bg); color: var(--text);
    border-radius: 10px; padding: 10px 12px; font: 14.5px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  input:focus { outline: 2px solid var(--brand); outline-offset: -1px; }
  .send { background: var(--brand); color: var(--brand-ink); border: 0; border-radius: 10px; padding: 0 14px; font-weight: 600; cursor: pointer; }
  .foot { padding: 0 16px 12px; font-size: 11.5px; color: var(--muted); }
  .chip.more { border-style: dashed; color: var(--brand); }
  .msg.wide { max-width: 100%; width: 100%; }
  details.qgroup { border-top: 1px solid var(--line); padding: 6px 0; }
  details.qgroup:first-of-type { border-top: 0; }
  details.qgroup summary { cursor: pointer; font-weight: 600; font-size: 13.5px; padding: 4px 0; }
  .qbtn { display: block; width: 100%; text-align: left; background: none; border: 0; color: var(--brand);
    font: 13.5px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 5px 0 5px 12px; cursor: pointer; }
  .qbtn:hover { text-decoration: underline; }
  .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
  .btn { border-radius: 8px; padding: 7px 12px; font: 600 13px/1.2 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    cursor: pointer; text-decoration: none; border: 1px solid var(--brand); }
  .btn.primary { background: var(--brand); color: var(--brand-ink); }
  .btn.secondary { background: var(--surface); color: var(--brand); }
  .linkbtn { background: none; border: 0; padding: 0; color: var(--brand); text-decoration: underline; cursor: pointer; font: inherit; }
  .msg.estimate { background: var(--surface); border: 1px solid var(--line); }
  .est-a { color: var(--muted); font-size: 13px; }
  .est-rows { display: flex; flex-direction: column; gap: 6px; margin: 8px 0; }
  .est-head { margin: 0 2px; padding: 0 10px; }
  .est-head small { font-weight: 600; }
  .est-row { border: 1px solid var(--line); border-radius: 10px; padding: 7px 10px; background: var(--bg); min-width: 0; }
  .est-row > a { font: 600 13px/1.3 ui-monospace, SFMono-Regular, Menlo, monospace; word-break: break-all; }
  .est-row.off { opacity: .75; }
  .est-n { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; margin-top: 4px; }
  .est-n b { display: block; font-size: 14px; }
  .est-n small { display: block; color: var(--muted); font-size: 11px; line-height: 1.25; }
  .est-note, .est-need { color: var(--muted); font-size: 12.5px; margin-top: 4px; }
  .est-f { color: var(--muted); font-size: 11.5px; }
  .est-stale { background: var(--warn-bg); border: 1px solid var(--warn-line); border-radius: 8px; padding: 6px 8px; font-size: 12px; }
  .est-form { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 6px 0 4px; padding: 10px; border: 1px solid var(--brand); border-radius: 10px; background: var(--bg); }
  .est-form .est-form-actions, .est-form .est-need { grid-column: 1 / -1; margin: 0; }
  .est-form input.bad { border-color: #b85450; outline-color: #b85450; }
  .est-updated { font-size: 11.5px; font-weight: 600; color: #3f8a3c; background: #e8f5e6; border-radius: 999px; padding: 2px 8px; margin-left: 4px; }
  .est-form label { font-size: 11.5px; color: var(--muted); display: flex; flex-direction: column; gap: 3px; min-width: 0; }
  .est-form input { padding: 6px 8px; font-size: 13.5px; width: 100%; min-width: 0; box-sizing: border-box; }
  .msg.wide { overflow-wrap: anywhere; }
  .asked { margin: 6px 0 0; padding-left: 18px; color: var(--muted); font-size: 13px; }
`;

const MARKUP = `
<button class="launcher" id="launcher" aria-expanded="false" aria-controls="panel">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  Ask OceanToken
</button>

<section class="panel" id="panel" role="dialog" aria-label="OceanToken assistant">
  <div class="head">
    <div><strong>OceanToken assistant</strong><small>Answers from the docs, with links</small></div>
    <button class="icon-btn" id="close" aria-label="Close">×</button>
  </div>
  <div class="log" id="log" aria-live="polite"></div>
  <div class="chips" id="chips"></div>
  <form id="form">
    <input id="q" autocomplete="off" placeholder="Ask about pricing, setup, models…" aria-label="Your question">
    <button class="send" type="submit">Send</button>
  </form>
  <div class="foot">Don't paste API keys here. Need a person? Use “Talk to a person” in More questions.</div>
</section>`;

function mount() {
const host = document.createElement("div");
host.id = "oceantoken-assistant";
const root = host.attachShadow({ mode: "open" });
root.innerHTML = `<style>${CSS}</style>${MARKUP}`;
document.body.appendChild(host);

const DOCS = "https://docs.oceantoken.ai";

// Knowledge base: every answer is paraphrased from docs.oceantoken.ai (llms-full.txt, generated 2026-10-17).
// Keywords carry weights; a question's score is the sum of matched keyword weights.
const KB = [
  { id: "what", title: "What is OceanToken?",
    kw: { "why should i use": 6, "why use": 5, "instead of": 4, "directly": 3, "benefit": 4, "为什么用": 6, "what is oceantoken": 6, "what's oceantoken": 6, "about oceantoken": 5, "what do you do": 5, "oceantoken是什么": 6, "介绍一下": 5 },
    a: `<p>OceanToken is one API and one prepaid balance for 400+ AI models: text, image, video, speech, transcription, embeddings and rerank, from publishers including OpenAI, Anthropic, Google, DeepSeek, Qwen and ByteDance.</p><p>It speaks the OpenAI and Anthropic APIs, so the SDK you already use works by changing the base URL and the model name.</p><p>Instead of one account and bill per provider, you get one key and one balance, with no platform fee on top of model prices, and many models have more than one official channel to fail over to.</p>`,
    src: [["Docs home", "/"]] },
  { id: "baseurl", title: "What's the base URL?",
    kw: { "base url": 5, "baseurl": 5, "endpoint": 3, "url": 2, "api address": 4, "openai sdk": 3, "compatible": 2, "switch": 2, "migrate": 2, "接口地址": 4 },
    a: `<p>For the OpenAI SDK and any OpenAI-compatible client: <code>https://api.oceantoken.ai/v1</code></p><p>For the Anthropic SDK (Claude models on the Messages API): <code>https://api.oceantoken.ai</code>. The SDK adds <code>/v1</code> itself, so don't add it twice.</p>`,
    src: [["First request", "/get-started/first-request"]] },
  { id: "start", title: "How do I get started?",
    kw: { "get started": 5, "start": 2, "first request": 5, "how do i use": 4, "setup": 2, "set up": 2, "begin": 2, "quickstart": 4, "怎么用": 4, "开始": 2 },
    a: `<ol><li>Create an account with your email.</li><li>Add credits to your prepaid balance.</li><li>Create an API key, with its own spending limit if you like.</li><li>Make your first request in curl, Python or TypeScript.</li></ol>`,
    src: [["Start here", "/"], ["First request", "/get-started/first-request"]] },
  { id: "pricing", title: "How does pricing work?",
    kw: { "price": 4, "pricing": 5, "cost": 3, "how much": 4, "expensive": 3, "cheap": 3, "cheaper": 5, "fee": 3, "markup": 4, "per token": 3, "价格": 4, "多少钱": 4, "收费": 3 },
    a: `<p>Prices are per model, in US dollars, and every price is what you pay, with no platform fee on top.</p><p>Text models are charged at the listed per-token price. Image, video, speech and other media are charged at the actual cost of each request. Every model and its price is on the Models page.</p>`,
    src: [["Models and prices", "/models"]] },
  { id: "free", title: "Is there a free tier?",
    kw: { "free": 5, "free tier": 6, "trial": 4, "free model": 6, "try without": 4, "免费": 5, "试用": 4 },
    a: `<p>Models whose ID ends in <code>:free</code> cost nothing to call, with limited and unguaranteed throughput.</p><p>One catch: like every model, they can be called only while your balance is above $0. After a first top-up, calls to free models don't reduce it, so you can test your SDK or agent setup without spending, then switch to a paid model by changing the model ID.</p>`,
    src: [["FAQ", "/faq"]] },
  { id: "credits", title: "How do I add credits?",
    kw: { "top up": 5, "topup": 5, "top-up": 5, "add credits": 6, "credit": 3, "credits": 3, "minimum": 4, "pay": 3, "payment": 4, "card": 3, "balance": 3, "recharge": 4, "充值": 5, "余额": 3, "付款": 3 },
    a: `<p>OceanToken is prepaid. In the console, open <b>Credits</b>, pick $10, $25, $50 or $100 or type an amount between $10 and $100,000, and pay by card on a hosted checkout page.</p><p>Purchased credits are valid for 12 months, and there's no monthly minimum. At a balance of $0 or below, requests are refused until you add credits.</p>`,
    src: [["Add credits", "/get-started/add-credits"]] },
  { id: "agents", title: "Can I use it with Claude Code or Cursor?",
    kw: { "claude code": 6, "codex": 6, "cursor": 6, "gemini cli": 6, "mcp": 5, "coding agent": 6, "agent": 2, "plugin": 3, "ide": 2, "编程": 3 },
    a: `<p>Yes. OceanToken has an MCP server and a plugin for Codex, Claude Code, Cursor, Gemini CLI and other MCP clients. Your agent gets tools to search models, estimate cost, generate images, video and voice-overs, transcribe audio, and hand sub-tasks to another model, all billed to your balance.</p><p>To install, ask your agent: “Install OceanToken for me by following https://mcp.oceantoken.ai/install”.</p>`,
    src: [["Connect your coding agent", "/agents/connect"]] },
  { id: "video", title: "Which video models can I use?",
    kw: { "video": 5, "seedance": 6, "veo": 6, "kling": 6, "sora": 6, "text to video": 6, "image to video": 6, "视频": 5 },
    a: `<p>Video models from several publishers are available on the same key, including ByteDance Seedance 2.0, Google Veo 3.1 and Kling. Each model's starting price and accepted inputs are on the Models page.</p><p>Video runs as a job: its estimated cost is held when it starts and settled to the actual cost when it finishes, and a failed job isn't charged. Download URLs last 24 hours.</p>`,
    src: [["Models and prices", "/models"], ["API", "/api"]] },
  { id: "errors", title: "Why am I getting a 401 or 400?",
    kw: { "401": 6, "400": 5, "error": 3, "invalid_api_key": 6, "insufficient_credits": 6, "not working": 4, "refused": 3, "unauthorized": 5, "报错": 4, "错误": 3 },
    a: `<ul><li><b>401 <code>invalid_api_key</code></b>: the key is missing or wrong. Send it as <code>Authorization: Bearer &lt;your key&gt;</code>.</li><li><b>400 <code>insufficient_credits</code></b>: your available credits are used up. Nothing ran and nothing was charged; add credits, then retry.</li><li><b>400 <code>model_not_found</code></b>: pick a name from <code>GET /v1/models</code>.</li></ul><p>Branch on the <code>code</code> field; it stays stable.</p>`,
    src: [["Errors", "/errors"]] },
  { id: "retention", title: "How long do you keep my data?",
    kw: { "retention": 6, "privacy": 5, "data": 2, "store": 3, "keep my": 5, "log": 2, "prompts": 3, "delete": 3, "zdr": 6, "zero data": 6, "gdpr": 4, "隐私": 5, "数据": 2 },
    a: `<p>Request content (your prompts and the responses) is kept for <b>365 days</b> after the request, then deleted automatically. You can ask for earlier deletion through <button class="linkbtn" type="button" data-handoff="answer">Talk to us</button>.</p><p>Uploaded and generated files are kept 30 days; image and video download URLs last 24 hours. These periods can't be changed in the console. The privacy policy has the full statement.</p>`,
    src: [["Limits · Retention", "/limits"], ["Privacy policy", "https://app.oceantoken.ai/legal/privacy"]] },
  { id: "limits", title: "What are the rate limits?",
    kw: { "rate limit": 6, "rate limits": 6, "higher limit": 6, "increase limit": 6, "429": 6, "rpm": 5, "tpm": 5, "timeout": 4, "limit": 2, "限流": 5 },
    a: `<p>Rate limits are per key, as requests and tokens per minute; responses carry them in the <code>x-oceantoken-key-rpm-limit</code> and <code>x-oceantoken-key-tpm-limit</code> headers. Going over returns <code>429 rate_limited</code> with a <code>Retry-After</code> header.</p><p>A synchronous request can run up to 240 seconds, with a 10 MB body, so use <code>stream: true</code> for long generations.</p><p>Limits are set by OceanToken for each account. To ask about higher limits, <button class="linkbtn" type="button" data-handoff="answer">talk to us</button>.</p>`,
    src: [["Limits", "/limits"]] },
  { id: "keys", title: "Can I set a spending limit per key?",
    kw: { "api key": 4, "key": 2, "spending limit": 8, "credit limit": 8, "budget": 4, "expiry": 4, "rotate": 4, "keys": 3 },
    a: `<p>Yes. Every key draws on your balance, and each one can have its own spending limit and expiry, so give each application its own key. You create and revoke keys in the console under API Keys.</p>`,
    src: [["Create an API key", "/get-started/create-api-key"]] },
  { id: "team", title: "Can my team share one balance?",
    kw: { "team": 5, "organization": 5, "org": 4, "invite": 5, "members": 4, "company": 3, "shared": 3, "团队": 5, "公司": 3 },
    a: `<p>Yes. Sign up with the <b>Organization</b> tab. An organization has one wallet: the administrator adds credits and can give each team a share of it, and no team can spend past its allocation. You can invite members from the console.</p>`,
    src: [["Create an account", "/get-started/create-account"], ["Add credits", "/get-started/add-credits"]] },
  { id: "reliability", title: "What happens if a model provider goes down?",
    kw: { "reliability": 6, "uptime": 5, "down": 4, "goes down": 6, "is down": 6, "unavailable": 5, "provider": 2, "outage": 5, "failover": 6, "fallback": 5, "stable": 3, "稳定": 4 },
    a: `<p>Many models have more than one channel, each an official or authorized source of the same model. When one fails, the gateway retries and moves the request to the next channel. You get an answer from the model you asked for, at the same price. Failover never swaps in a different model unless you ask for one with <code>fallbacks</code>.</p>`,
    src: [["Reliability", "/reliability"]] },
  { id: "signup", title: "How do I sign up?",
    kw: { "sign up": 6, "signup": 6, "register": 6, "account": 3, "login": 4, "log in": 4, "google": 3, "activation": 5, "email": 2, "password": 3, "注册": 6, "登录": 4 },
    a: `<p>Go to <a href="https://app.oceantoken.ai/ui/signup" target="_blank" rel="noopener">app.oceantoken.ai/ui/signup</a>, enter your email, open the link we send, and set a password. That activates the account. If the email doesn't arrive in a few minutes, check spam and request it again. Disposable addresses aren't accepted.</p><p>After that you can also sign in with Google, using the same email.</p>`,
    src: [["Create an account", "/get-started/create-account"]] },
  // ---- Added 2026-10-19: questions predicted from OpenRouter's FAQ (36 questions, 7 groups), answered from OceanToken docs / Terms / Privacy ----
  { id: "models", title: "Which models can I use?",
    kw: { "which models": 6, "what models": 6, "model list": 5, "how many models": 6, "catalog": 4, "deepseek": 4, "qwen": 4, "gemini": 4, "llama": 4, "kimi": 4, "glm": 4, "mistral": 4, "grok": 4, "context window": 5, "有哪些模型": 6, "模型列表": 5 },
    a: `<p>Nearly 500 models across 7 types: language models (GPT, Claude, Gemini, DeepSeek, Qwen, GLM, Kimi, Grok, Mistral, Llama and more), image generation and editing, video, text-to-speech, speech-to-text, embeddings and rerankers.</p><p>The Models page lists each one with its exact model ID, price, context window, and whether it supports reasoning, tool calling or image input. It's rebuilt from the live service every time the docs are published.</p>`,
    src: [["FAQ", "/faq"], ["Models and prices", "/models"]] },
  { id: "media", title: "Can it do images, speech or embeddings?",
    kw: { "image": 5, "images": 5, "speech": 5, "tts": 5, "voice": 4, "transcri": 5, "subtitle": 5, "embedding": 6, "embeddings": 6, "rerank": 6, "图片": 5, "语音": 5, "向量": 5 },
    a: `<p>Yes, on the same key and balance:</p><ul><li>Images: <code>/v1/images/generations</code> and <code>/v1/images/edits</code></li><li>Text-to-speech: <code>/v1/audio/speech</code>; transcription: <code>/v1/audio/transcriptions</code></li><li>Embeddings: <code>/v1/embeddings</code>; rerank: <code>/v1/rerank</code> (Cohere shape)</li></ul><p>Image and video download URLs stay valid for 24 hours, so save files promptly.</p>`,
    src: [["FAQ", "/faq"], ["API", "/api"]] },
  { id: "sdks", title: "Which SDKs and endpoints work?",
    kw: { "sdk": 6, "sdks": 6, "python": 4, "typescript": 5, "javascript": 5, "langchain": 4, "library": 3, "endpoints": 6, "responses api": 6, "chat completions": 5, "messages api": 5, "支持哪些": 3 },
    a: `<p>OceanToken doesn't invent its own request formats. Each endpoint follows an existing API, so the official SDK works with only the base URL and key changed:</p><ul><li><b>OpenAI shape</b>: chat completions, responses, images, video, embeddings, speech, transcription, models</li><li><b>Anthropic shape</b>: <code>/v1/messages</code> for Claude models</li><li><b>Cohere shape</b>: <code>/v1/rerank</code></li></ul><p>The OpenAI SDKs for Python, TypeScript and other languages all work.</p>`,
    src: [["API", "/api"], ["FAQ", "/faq"]] },
  { id: "stream", title: "Does it support streaming?",
    kw: { "stream": 6, "streaming": 6, "sse": 5, "流式": 6 },
    a: `<p>Yes. Set <code>stream: true</code>; tokens arrive as they're generated. Stream anything a person is waiting on, and any long answer: a non-streamed request is closed after 240 seconds.</p><p>Check that every stream ends with a finish reason (<code>finish_reason</code>, <code>stop_reason</code>, or <code>response.completed</code>). One that doesn't is incomplete, so retry it.</p>`,
    src: [["First request", "/get-started/first-request"], ["Reliability", "/reliability"]] },
  { id: "params", title: "Does it support tool calling and JSON output?",
    kw: { "tool call": 6, "tool calling": 6, "function call": 6, "function calling": 6, "json": 4, "structured": 5, "response_format": 6, "parameter": 4, "temperature": 4, "top_k": 5, "vision": 4 },
    a: `<p>Where the model supports it, yes. The Models page shows whether each model supports tool calling, reasoning or image input.</p><p>One thing to know: if you send a parameter the chosen model doesn't support, it's dropped and the request still succeeds. So check the response for what you depend on, like <code>tool_calls</code> or JSON in the content, once at integration time with the model you'll use.</p>`,
    src: [["API · Which API shape", "/api"]] },
  { id: "charged", title: "Am I charged for failed requests?",
    kw: { "charged": 4, "failed": 4, "billed": 3, "double charge": 6, "pay for errors": 6, "retry": 3, "扣费": 5, "失败": 4 },
    a: `<ul><li>An attempt that fails before the model produces output isn't billed, and the gateway's own retries and channel switches are free.</li><li>A request refused for no credits, or by a safety check, isn't charged.</li><li>A stream that breaks after output started is billed for the prompt and the output up to that point.</li><li>A failed video job releases its hold on your balance.</li></ul><p>Send an <code>Idempotency-Key</code> on image, video and speech requests so a retry never runs and bills twice.</p>`,
    src: [["Reliability · Billing", "/reliability"], ["Errors", "/errors"]] },
  { id: "usage", title: "Where can I see my usage and spend?",
    kw: { "usage": 5, "spend": 5, "spending": 4, "monitor": 5, "dashboard": 5, "analytics": 5, "activity": 5, "logs": 5, "how much did": 5, "用量": 6, "消费": 5 },
    a: `<ul><li><b>Activity</b>: spend, requests and tokens over 7 or 30 days, daily spend, and top models and keys.</li><li><b>Logs</b>: every request from the last 24 hours or 7 days, with model, tokens, cost, latency and time to first token.</li><li><b>API</b>: <code>GET /v1/usage/{request_id}</code> returns what one request cost.</li></ul>`,
    src: [["Activity", "/console/activity"], ["Logs", "/console/logs"]] },
  { id: "expire", title: "Do credits expire?",
    kw: { "expire": 7, "expiration": 6, "valid for": 5, "unused credits": 5, "过期": 6 },
    a: `<p>Purchased credits are valid for 12 months from the date of purchase. Credits from trial codes, promotions or gifts may expire sooner. There's no monthly minimum.</p>`,
    src: [["Add credits", "/get-started/add-credits"], ["Terms §6", "https://app.oceantoken.ai/legal/terms"]] },
  { id: "refund", title: "Can I get a refund?", review: true,
    kw: { "refund": 8, "refunds": 8, "money back": 6, "chargeback": 6, "退款": 6 },
    a: `<p>Under the Terms of Service, credit purchases are final and non-refundable, except where the law requires a refund. If OceanToken discontinues the service, or closes your account for convenience while you're not in breach, unused and unexpired purchased credits are refunded.</p><p>Since credits are prepaid, start with a small top-up ($10 is the minimum). For a billing problem, <button class="linkbtn" type="button" data-handoff="answer">talk to us</button>.</p>`,
    src: [["Terms §6", "https://app.oceantoken.ai/legal/terms"]] },
  { id: "paymethods", title: "What payment methods do you accept?",
    kw: { "payment method": 6, "credit card": 5, "debit card": 5, "paypal": 6, "crypto": 6, "alipay": 6, "wechat": 6, "bank transfer": 6, "wire": 4, "invoice": 5, "支付宝": 6, "微信": 6, "发票": 5 },
    a: `<p>Credits are added by card, on a hosted checkout page in the console. Organizations with an agreed monthly allowance don't need to add credits; their balance is funded for them.</p><p>For other payment methods or invoicing, <button class="linkbtn" type="button" data-handoff="answer">talk to us</button>.</p>`,
    src: [["Add credits", "/get-started/add-credits"]] },
  { id: "missing", title: "I paid, but my credits don't show",
    kw: { "don't show": 6, "not showing": 6, "didn't show": 6, "not received": 5, "paid but": 6, "missing credits": 6, "没到账": 6 },
    a: `<p>When payment completes, you return to the console and the new balance shows under <b>Available balance</b>. Available means your balance minus holds for jobs still running, such as video or deep research, so it can be lower than your total while those finish.</p><p>If the payment went through and your balance hasn't changed, <button class="linkbtn" type="button" data-handoff="answer">talk to us</button> and include your account email and the time of payment. Never send card details.</p>`,
    src: [["Add credits", "/get-started/add-credits"], ["Limits · Spending", "/limits"]] },
  { id: "account", title: "How do I export my data or close my account?",
    kw: { "delete my account": 7, "delete account": 7, "close account": 7, "close my account": 7, "export": 5, "download my data": 6, "change email": 6, "change password": 6, "reset password": 6, "forgot password": 6, "注销": 6, "改密码": 6 },
    a: `<p>On the <b>Profile</b> page:</p><ul><li><b>Download my data</b> saves a JSON copy of your profile, keys, usage summary and memberships.</li><li><b>Close my account</b> deactivates it, and keys stop working immediately. Closing doesn't delete stored records; to have them deleted, <button class="linkbtn" type="button" data-handoff="answer">talk to us</button>.</li><li>Change your email there too. For your password, sign out and use <a href="https://app.oceantoken.ai/ui/forgot-password" target="_blank" rel="noopener">Reset your password</a>.</li></ul>`,
    src: [["Profile", "/console/account"]] },
  { id: "residency", title: "Where is my data processed?", review: true,
    kw: { "where is my data": 7, "data residency": 7, "residency": 6, "region": 5, "europe": 5, "country": 4, "processed": 4, "数据存在哪": 6, "地区": 4 },
    a: `<p>The standard service doesn't include a data-residency commitment for any country or region. Requests may be processed by OceanToken and by model providers in different jurisdictions.</p><p>If you need country-specific processing or special data handling, that requires a separate written agreement before you send that data. <button class="linkbtn" type="button" data-handoff="answer">Talk to us</button> about it.</p>`,
    src: [["Terms §10", "https://app.oceantoken.ai/legal/terms"], ["Privacy policy", "https://app.oceantoken.ai/legal/privacy"]] },
  { id: "training", title: "Is my data used for training?", review: true,
    kw: { "train": 5, "training": 6, "used to train": 7, "share my data": 6, "third party": 5, "third-party": 5, "sell my data": 6, "训练": 6 },
    a: `<p>Each request is sent to the provider of the model you chose. That provider processes it under its own terms and data policies, so check the policy of the provider behind the model you use. OceanToken uses request content to provide and improve its services, as the privacy policy describes.</p><p>Request content is kept 365 days. You can ask for earlier deletion through <button class="linkbtn" type="button" data-handoff="answer">Talk to us</button>.</p>`,
    src: [["Privacy policy", "https://app.oceantoken.ai/legal/privacy"], ["Limits · Retention", "/limits"]] },
  { id: "official", title: "Are these the official models?",
    kw: { "official": 6, "authorized": 6, "real model": 6, "distilled": 6, "quantized": 6, "same quality": 5, "fake": 5, "正版": 6, "官方": 5 },
    a: `<p>Every channel behind a model is an official or authorized source of that same model. If a channel fails, the request moves to another channel of the same model at the same price; it's never answered by a different model unless you name backups yourself.</p><p>The <code>x-oceantoken-model</code> response header names the model that answered.</p>`,
    src: [["Reliability", "/reliability"]] },
  { id: "backups", title: "Can I set backup models?",
    kw: { "backup model": 7, "backup models": 7, "fallbacks": 7, "fallback model": 7, "if a model fails": 5, "备用模型": 7 },
    a: `<p>Yes. Add <code>fallbacks</code> to the request body: a list of model names to try, in order, if the model you asked for fails on all its channels. It works on <code>/v1/chat/completions</code> and <code>/v1/responses</code>.</p><p>You're billed at the price of the model that answered, which the <code>x-oceantoken-model</code> header names. Errors about your key, balance or rate limit return without trying backups.</p>`,
    src: [["Reliability · Your own backup models", "/reliability"]] },
  { id: "cache", title: "Does prompt caching work?",
    kw: { "cache": 5, "caching": 6, "cached": 5, "prompt caching": 7, "缓存": 6 },
    a: `<p>On models that support it, the Models page lists a separate <b>Cached input</b> price, plus a <b>Cache write</b> price where the model charges for one. Activity shows cache read and write tokens, and each request in Logs shows a cache Hit or Miss.</p><p>Caches are kept per channel, so the first request served by a different channel may be billed at the regular input rate.</p>`,
    src: [["Models and prices", "/models"], ["Reliability · Billing", "/reliability"]] },
  { id: "chat", title: "Can I use it without writing code?",
    kw: { "without code": 6, "no code": 6, "without writing code": 7, "in the browser": 5, "chatgpt": 5, "deep research": 6, "playground": 5, "web app": 5, "smart router": 6, "smart-router": 6, "auto select": 6, "不用写代码": 6 },
    a: `<p>Yes. <b>Chat</b> in the console lets you talk to any text model, create images and videos, run deep research, work with files, and use a code interpreter that produces Word, Excel and PowerPoint files. It uses the same balance and prices as the API.</p><p>The model selector starts on <b>Smart (Auto)</b>, which picks a model for each message; you're billed at the price of the model it picks.</p>`,
    src: [["Chat", "/console/chat"]] },
  { id: "latency", title: "How fast is it? Is there an SLA?", review: true,
    kw: { "latency": 7, "speed": 4, "slow": 5, "ttft": 7, "response time": 6, "sla": 6, "uptime": 4, "延迟": 6, "慢": 4 },
    a: `<p>Without a separate SLA, the service is provided as available, with no commitment on uptime, latency or throughput.</p><p>You can see real numbers for your own requests: Logs shows latency, time to first token and throughput for each one. For anything a person waits on, stream the response so the first tokens arrive sooner.</p>`,
    src: [["Terms §20", "https://app.oceantoken.ai/legal/terms"], ["Logs", "/console/logs"]] },
  { id: "leak", title: "My API key leaked. What do I do?",
    kw: { "leaked": 7, "leak": 6, "compromised": 7, "stolen": 6, "exposed": 6, "misused": 6, "泄露": 7 },
    a: `<p>Open the key under <b>API Keys</b> in the console:</p><ul><li><b>Rotate key</b> issues a new secret and keeps the old one working for 24 hours while you update your app.</li><li>If the key is actively being misused, <b>delete</b> it instead. Deletion is immediate, and requests with it return <code>401</code>.</li></ul><p>Keys can only be managed in the console, never with an API key.</p>`,
    src: [["API Keys · Rotate a key", "/console/api-keys"]] },
  { id: "report", title: "How do I report a problem?",
    kw: { "bug": 6, "report": 4, "request id": 7, "request-id": 7, "something wrong": 5, "反馈问题": 6 },
    a: `<p><button class="linkbtn" type="button" data-handoff="answer">Talk to us</button> and include the <code>x-oceantoken-request-id</code> header from the failing response (the same id is in the response body and in Logs). It lets us find the exact request. A <code>401</code> never reached a model, so it has no request id.</p>`,
    src: [["Errors · The request ID", "/errors"]] },
  { id: "estimate", action: "estimate", title: "Estimate my cost",
    kw: { "estimate": 7, "how much will": 8, "how much would": 8, "cost me": 7, "per month": 5, "monthly cost": 7, "monthly bill": 7, "budget": 5, "calculator": 7, "calculate": 6, "预估": 7, "估算": 7, "每月多少": 7, "一个月多少": 7, "多少钱一个月": 7 },
    a: "", src: [] },
  { id: "gap", gap: true, title: "Not in the docs yet",
    kw: { "byok": 8, "own key": 6, "own openai key": 8, "bring my own": 8, "volume discount": 8, "discounts": 6, "discount": 6, "soc2": 8, "soc 2": 8, "iso 27001": 8, "hipaa": 8, "sso": 6, "saml": 7, "make money": 7, "business model": 6, "become a provider": 8, "list my model": 8, "new models added": 7, "how often": 3, "折扣": 7 },
    a: `<p>That isn't covered in the OceanToken docs yet, so I won't guess. We've noted the question so the docs can cover it.</p>`,
    src: [], handoff: true },
  { id: "human", title: "Talk to a person",
    kw: { "human": 6, "person": 5, "support": 5, "contact": 5, "sales": 5, "talk to": 4, "help me": 3, "enterprise": 4, "人工": 6, "客服": 6, "联系": 5 },
    a: `<p>Sure. A person can pick this up from here.</p>`,
    src: [], handoff: true },
];

/* ESTIMATOR START — pure functions, no DOM. Tested by estimate.test.js; prices injected by build_price_snapshot.py */
const PRICES = /*PRICES*/{"built_at":"2026-10-17","models":{"openai/gpt-5.5":{"id":"openai/gpt-5.5","page":"https://docs.oceantoken.ai/models/openai/gpt-5.5","context":1050000,"unit":"tokens","input":5.0,"output":30.0,"cached":0.5},"anthropic/claude-sonnet-5.5":{"id":"anthropic/claude-sonnet-5.5","page":"https://docs.oceantoken.ai/models/anthropic/claude-sonnet-5.5","context":1000000,"unit":"tokens","input":2.0,"output":10.0,"cached":0.2},"google/gemini-3.5-flash":{"id":"google/gemini-3.5-flash","page":"https://docs.oceantoken.ai/models/google/gemini-3.5-flash","context":1048576,"unit":"tokens","input":1.5,"output":9.0,"cached":0.15},"deepseek/deepseek-v4-flash":{"id":"deepseek/deepseek-v4-flash","page":"https://docs.oceantoken.ai/models/deepseek/deepseek-v4-flash","context":1048576,"unit":"tokens","input":0.098,"output":0.196,"cached":0.0196},"bytedance-seed/seedream-5-0-pro":{"id":"bytedance-seed/seedream-5-0-pro","page":"https://docs.oceantoken.ai/models/bytedance-seed/seedream-5-0-pro","unit":"image","price":0.09},"qwen/qwen-image-3-pro":{"id":"qwen/qwen-image-3-pro","page":"https://docs.oceantoken.ai/models/qwen/qwen-image-3-pro","unit":"image","price":0.075},"bytedance-seed/seedream-4.5":{"id":"bytedance-seed/seedream-4.5","page":"https://docs.oceantoken.ai/models/bytedance-seed/seedream-4.5","unit":"image","price":0.04},"qwen/qwen-image-3":{"id":"qwen/qwen-image-3","page":"https://docs.oceantoken.ai/models/qwen/qwen-image-3","unit":"image","price":0.03},"google/veo-3.1":{"id":"google/veo-3.1","page":"https://docs.oceantoken.ai/models/google/veo-3.1","unit":"second","price":0.2,"from_price":true},"google/veo-3.1-fast":{"id":"google/veo-3.1-fast","page":"https://docs.oceantoken.ai/models/google/veo-3.1-fast","unit":"second","price":0.08,"from_price":true},"bytedance/seedance-2.0":{"id":"bytedance/seedance-2.0","page":"https://docs.oceantoken.ai/models/bytedance/seedance-2.0","unit":"second","price":0.0673,"from_price":true},"bytedance/seedance-2.0-mini":{"id":"bytedance/seedance-2.0-mini","page":"https://docs.oceantoken.ai/models/bytedance/seedance-2.0-mini","unit":"second","price":0.0336,"from_price":true},"deepgram/aura-2":{"id":"deepgram/aura-2","page":"https://docs.oceantoken.ai/models/deepgram/aura-2","unit":"1k_chars","price":0.03},"fish-audio/s1":{"id":"fish-audio/s1","page":"https://docs.oceantoken.ai/models/fish-audio/s1","unit":"1k_chars","price":0.015},"canopylabs/orpheus-3b-0.1-ft":{"id":"canopylabs/orpheus-3b-0.1-ft","page":"https://docs.oceantoken.ai/models/canopylabs/orpheus-3b-0.1-ft","unit":"1k_chars","price":0.007},"google/chirp-3":{"id":"google/chirp-3","page":"https://docs.oceantoken.ai/models/google/chirp-3","unit":"minute","price":0.016},"fish-audio/transcribe-1":{"id":"fish-audio/transcribe-1","page":"https://docs.oceantoken.ai/models/fish-audio/transcribe-1","unit":"minute","price":0.006},"deepgram/nova-3":{"id":"deepgram/nova-3","page":"https://docs.oceantoken.ai/models/deepgram/nova-3","unit":"minute","price":0.0043}}}/*END PRICES*/;
const VOLUME_HANDOFF_USD = 5000;   // monthly estimate at which the card offers Talk to us (PRD Q11)
const STALE_DAYS = 7;
const EST = {
  text: {
    label: "Text",
    models: ["openai/gpt-5.5", "anthropic/claude-sonnet-5.5", "google/gemini-3.5-flash", "deepseek/deepseek-v4-flash"],
    fields: [["requests", "per month", 1], ["input", "input tokens each", 1], ["output", "output tokens each", 1], ["cache", "% of input cached", 1]],
    templates: [
      { id: "support", name: "Customer support bot", task: "conversation", params: { requests: 10000, input: 3000, output: 500, cache: 50 } },
      { id: "coding", name: "Coding agent task", task: "task", params: { requests: 200, input: 50000, output: 5000, cache: 80 } },
      { id: "summary", name: "Summarize documents", task: "document", params: { requests: 1000, input: 8000, output: 800, cache: 0 } },
    ],
  },
  image: {
    label: "Image",
    models: ["bytedance-seed/seedream-5-0-pro", "qwen/qwen-image-3-pro", "bytedance-seed/seedream-4.5", "qwen/qwen-image-3"],
    fields: [["images", "final images per month", 1], ["tries", "tries per image", 1], ["mp", "megapixels each", 0.1]],
    templates: [{ id: "product", name: "Product photos", task: "image", params: { images: 200, tries: 2, mp: 1 } }],
  },
  video: {
    label: "Video",
    models: ["google/veo-3.1", "google/veo-3.1-fast", "bytedance/seedance-2.0", "bytedance/seedance-2.0-mini"],
    fields: [["seconds", "seconds each", 1], ["items", "per month", 1], ["tries", "tries per shot", 1]],
    templates: [
      { id: "ad", name: "Short ad", task: "ad", params: { seconds: 30, items: 4, tries: 3 } },
      { id: "drama", name: "Short-drama episode", task: "episode", params: { seconds: 180, items: 22, tries: 5 } },
    ],
  },
  speech: {
    label: "Speech",
    models: ["deepgram/aura-2", "fish-audio/s1", "canopylabs/orpheus-3b-0.1-ft"],
    fields: [["chars", "characters per month", 1000]],
    templates: [{ id: "narration", name: "Narration", task: "month", params: { chars: 50000 } }],
  },
  transcription: {
    label: "Transcription",
    models: ["google/chirp-3", "fish-audio/transcribe-1", "deepgram/nova-3"],
    fields: [["minutes", "minutes of audio per month", 10]],
    templates: [{ id: "meetings", name: "Meeting notes", task: "month", params: { minutes: 600 } }],
  },
};

function missingParams(type, params) {
  return EST[type].fields.map(([k]) => k).filter((k) => !(typeof params[k] === "number" && isFinite(params[k]) && params[k] >= 0));
}

// Returns { rows, out_of_range, stale, prices_as_of, missing }. Every number comes from PRICES; nothing is guessed.
function estimate(type, params, prices = PRICES, now = new Date()) {
  const cfg = EST[type];
  const missing = missingParams(type, params);
  const prices_as_of = prices.built_at;
  const stale = (now - new Date(prices_as_of + "T00:00:00Z")) / 86400000 > STALE_DAYS;
  if (missing.length) return { rows: [], missing, stale, prices_as_of, out_of_range: false };
  const p = params;
  const rows = cfg.models.map((id) => {
    const m = prices.models[id];
    if (!m) return { model_id: id, state: "unavailable", note: "Not in the catalog any more" };
    const row = { model_id: id, page: m.page, state: "ok", from: !!m.from_price };
    switch (m.unit) {
      case "tokens": {
        if (m.context && p.input > m.context) return { ...row, state: "context_exceeded", note: `Input exceeds its ${m.context.toLocaleString("en-US")}-token context window` };
        const c = Math.min(Math.max(p.cache, 0), 100) / 100;
        const cached = m.cached ?? m.input;
        row.per_task = (p.input * (1 - c) * m.input + p.input * c * cached + p.output * m.output) / 1e6;
        row.per_month = row.per_task * p.requests;
        row.per_10 = row.per_task > 0 ? Math.floor(10 / row.per_task) : null;
        break;
      }
      case "image":
      case "megapixel": {
        const gen = m.unit === "image" ? m.price : m.first_mp + Math.max(0, p.mp - 1) * m.further_mp;
        row.per_task = gen * p.tries;           // one final image, all tries included
        row.per_month = row.per_task * p.images;
        row.per_10 = Math.floor(10 / gen);      // generations per $10
        break;
      }
      case "second":
        row.per_task = p.seconds * p.tries * m.price;   // one ad / episode, all tries included
        row.per_month = row.per_task * p.items;
        row.per_10 = Math.floor(10 / m.price);          // seconds of generated video per $10
        break;
      case "1k_chars":
        row.per_task = m.price;                          // per 1,000 characters
        row.per_month = (p.chars / 1000) * m.price;
        row.per_10 = Math.floor((10 / m.price) * 1000);  // characters per $10
        break;
      case "minute":
        row.per_task = m.price;
        row.per_month = p.minutes * m.price;
        row.per_10 = Math.floor(10 / m.price);           // minutes per $10
        break;
      default:
        return { ...row, state: "unavailable", note: m.unit === "image_tokens" ? "Priced per image token: try one request and check Logs" : "No published price yet" };
    }
    return row;
  });
  const ok = rows.filter((r) => r.state === "ok").sort((a, b) => b.per_month - a.per_month);
  return {
    rows: ok.concat(rows.filter((r) => r.state !== "ok")),
    missing: [], stale, prices_as_of,
    out_of_range: ok.some((r) => r.per_month >= VOLUME_HANDOFF_USD),
  };
}
/* ESTIMATOR END */

const STARTERS = ["baseurl", "pricing", "estimate", "agents"];
const FAQ_URL = DOCS + "/faq";
// "More questions": every answer grouped the way the docs FAQ is (human and gap entries are reached via hand-off).
const GROUPS = [
  ["Getting started", ["what", "start", "baseurl", "signup", "sdks", "chat"]],
  ["Pricing and credits", ["estimate", "pricing", "free", "credits", "expire", "charged", "usage", "paymethods", "missing", "refund"]],
  ["Models and features", ["models", "media", "video", "agents", "stream", "params", "cache", "official"]],
  ["Reliability and limits", ["reliability", "backups", "limits", "latency", "errors", "report"]],
  ["Keys, account and privacy", ["keys", "leak", "team", "account", "retention", "residency", "training"]],
];
const asked = [];          // questions typed this session (never secrets), carried into the hand-off
let faqVisited = false, faqNudged = false;
// Answers marked review: true touch refunds, data handling or SLAs; legal/owner must approve the wording before launch.
const ANSWER_MIN = 5, SUGGEST_MIN = 2;
// Docs show keys as `sk-...` (Authorization: Bearer sk-...). Also catch any long unbroken token.
const KEY_PATTERN = /\bsk-[A-Za-z0-9_-]{12,}|\b[A-Za-z0-9_-]{32,}\b/;

const $ = (id) => root.getElementById(id);
const log = $("log"), chips = $("chips"), panel = $("panel"), launcher = $("launcher"), input = $("q");

// Instrumentation stub: in production these go to analytics (see funnel framework §5).
function track(event, props = {}) { console.log("[assistant]", event, props); }

function score(question) {
  const q = " " + question.toLowerCase().replace(/[?？!！.,，。]/g, " ") + " ";
  return KB.map((e) => {
    let s = 0;
    for (const [k, w] of Object.entries(e.kw)) if (q.includes(k)) s += w;
    return { e, s };
  }).filter((r) => r.s > 0).sort((a, b) => b.s - a.s);
}

// Scroll after layout settles: chips and forms change the log's height right after a message is added,
// so the newest answer is re-aligned to the top of the log whenever the log resizes. null = follow the bottom.
let pinned = null;
function applyPin() {
  const max = log.scrollHeight - log.clientHeight;
  log.scrollTop = pinned && pinned.isConnected ? Math.max(0, Math.min(pinned.offsetTop - 12, max)) : max;
}
function pinTo(el) {
  pinned = el;
  applyPin();
  setTimeout(applyPin, 50);    // after chips / card content settle
  setTimeout(applyPin, 200);
}
new ResizeObserver(() => applyPin()).observe(log);
log.addEventListener("wheel", () => { pinned = null; }, { passive: true });   // the visitor scrolled: stop re-aligning
log.addEventListener("touchmove", () => { pinned = null; }, { passive: true });

function addMsg(html, who = "bot", extraClass = "") {
  const div = document.createElement("div");
  div.className = `msg ${who} ${extraClass}`.trim();
  div.innerHTML = html;
  log.appendChild(div);
  // Long answers: show their first line, not their last.
  pinTo(who === "bot" ? div : null);
  return div;
}

function sourcesHtml(src) {
  if (!src.length) return "";
  const links = src.map(([label, path]) => {
    const href = path.startsWith("http") ? path : DOCS + path;
    return `<a href="${href}" target="_blank" rel="noopener">${label} ↗</a>`;
  }).join("");
  return `<div class="sources">Source: ${links}</div>`;
}

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function bind(div) {
  div.querySelectorAll("[data-ask]").forEach((b) => { b.onclick = () => { const e = KB.find((x) => x.id === b.dataset.ask); ask(e.title, e.id); }; });
  div.querySelectorAll("[data-faq]").forEach((a) => { a.onclick = () => { faqVisited = true; faqNudged = false; track("faq_opened", { from: a.dataset.faq }); }; });
  div.querySelectorAll("[data-handoff]").forEach((b) => { b.onclick = () => handoff(b.dataset.handoff); });
  div.querySelectorAll("[data-talk]").forEach((b) => { b.onclick = () => openTalkToUs(); });
  div.querySelectorAll("[data-etype]").forEach((b) => { b.onclick = () => chooseType(b.dataset.etype); });
  div.querySelectorAll("[data-etpl]").forEach((b) => { b.onclick = () => { const [ty, id] = b.dataset.etpl.split(":"); chooseTemplate(ty, id); }; });
  div.querySelectorAll("[data-done]").forEach((b) => { b.onclick = () => { track("faq_resolved", {}); addMsg(`<p>Glad that helped. Ask me anything else any time.</p>`); setChips(STARTERS); }; });
}

const faqLink = (from) => `<a class="btn secondary" href="${FAQ_URL}" target="_blank" rel="noopener" data-faq="${from}">Browse the FAQ ↗</a>`;
const personBtn = (from) => `<button class="btn primary" type="button" data-handoff="${from}">Talk to a person</button>`;

function showMore() {
  track("more_opened", {});
  chips.innerHTML = "";
  const groups = GROUPS.map(([name, ids], i) =>
    `<details class="qgroup"${i === 0 ? " open" : ""}><summary>${name} (${ids.length})</summary>` +
    ids.map((id) => `<button class="qbtn" type="button" data-ask="${id}">${esc(KB.find((x) => x.id === id).title)}</button>`).join("") +
    `</details>`).join("");
  bind(addMsg(`<p>Here's everything I can answer. Pick one:</p>${groups}<p style="margin-top:10px">Not here? The FAQ has longer answers, and a person can help with anything else.</p><div class="actions">${faqLink("more")}${personBtn("more")}</div>`, "bot", "wide"));
}

// Every hand-off goes to the site's own "Talk to us" form (homepage header), never to a second channel.
const SITE_HOME = "https://oceantoken.ai/";
function talkButton() {
  return [...document.querySelectorAll("button, a")].find((el) => /^talk to us\b/i.test(el.textContent.trim()) && !host.contains(el));
}
function contextText() {
  const recent = asked.slice(-5);
  return recent.length ? "Asked the site assistant first:\n" + recent.map((q, i) => `${i + 1}. ${q}`).join("\n") + "\n\n" : "";
}
// Best effort: put what the user already asked into the form's free-text field. They see it and decide whether to send.
function prefillForm(text, tries = 10) {
  const field = [...document.querySelectorAll("textarea")].find((el) => !host.contains(el) && el.offsetParent !== null);
  if (!field) { if (tries > 0) setTimeout(() => prefillForm(text, tries - 1), 100); return; }
  if (field.value.trim()) return;  // never overwrite what the user typed
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set;
  setter.call(field, text);
  field.dispatchEvent(new Event("input", { bubbles: true }));
}
function openTalkToUs() {
  const b = talkButton();
  track("handoff_started", { channel: b ? "talk_to_us_form" : "talk_to_us_homepage", questions: asked.length });
  if (b) { closePanel(); b.click(); const text = contextText(); if (text) prefillForm(text); }
  else window.open(SITE_HOME, "_blank", "noopener");
}

function handoff(from) {
  track("handoff_shown", { from, questions: asked.length });
  chips.innerHTML = "";
  const recent = asked.slice(-5);
  const onPage = !!talkButton();
  const list = recent.length ? `<p>${onPage ? "I'll add what you asked to the form, so you don't have to type it again" : "Mention what you asked here"}:</p><ol class="asked">${recent.map((q) => `<li>${esc(q)}</li>`).join("")}</ol>` : "";
  const how = onPage ? "Tell us what you need and a person on our team will reply." : "The Talk to us form is on the OceanToken homepage. A person on our team will reply.";
  bind(addMsg(`<p><b>Talk to a person</b></p><p>${how} Never include your API key.</p>${list}<div class="actions"><button class="btn primary" type="button" data-talk="1">${onPage ? "Talk to us" : "Open Talk to us ↗"}</button></div>`, "bot", "wide"));
  setChips([]);  // keep the hand-off card in view: only the More questions chip
}

// ---- Cost estimate UI (PRD Flow D). The card only renders what estimate() returns. ----
const SIGNUP_URL = "https://app.oceantoken.ai/ui/signup";
const usd = (x) => x < 1 ? "$" + (x + 1e-12).toFixed(4)
  : "$" + x.toLocaleString("en-US", x >= 1000 ? { maximumFractionDigits: 0 } : { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const approx = (n) => "~" + (n >= 100 ? Number(n.toPrecision(3)) : n).toLocaleString("en-US");  // 3 significant figures
const num = (n) => n.toLocaleString("en-US");
const dateLabel = (iso) => new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

function assumptions(type, tpl, p) {
  if (type === "text") return `${num(p.requests)} ${tpl.task}s / month · ${num(p.input)} input tokens (${p.cache}% cached) + ${num(p.output)} output tokens each`;
  if (type === "image") return `${num(p.images)} images / month · ${p.tries} tries each · ${p.mp} MP`;
  if (type === "video") return `${num(p.items)} × ${p.seconds}-second ${tpl.task}s / month · ${p.tries} tries per shot`;
  if (type === "speech") return `${num(p.chars)} characters / month`;
  return `${num(p.minutes)} minutes of audio / month`;
}
function columns(type, tpl) {
  return {
    text: [`per ${tpl.task}`, "per month", `${tpl.task}s per $10`],
    image: ["per image (all tries)", "per month", "images per $10"],
    video: [`per ${tpl.task} (from)`, "per month (from)", "seconds per $10"],
    speech: ["per 1K characters", "per month", "characters per $10"],
    transcription: ["per minute", "per month", "minutes per $10"],
  }[type];
}
const FOOT_NOTE = {
  text: "Long-prompt surcharges and web search aren't included.",
  image: "Images are billed at the actual cost of each request.",
  video: "From the lowest resolution; higher resolutions and modes cost more.",
  speech: "Speech is billed at the actual cost of each request.",
  transcription: "Transcription is billed at the actual cost of each request.",
};
const TYPE_WORDS = [["video", /video|seedance|veo|sora|kling|视频|短剧/i], ["image", /image|photo|picture|图片|图像/i],
  ["speech", /speech|voice|tts|narrat|配音|语音合成/i], ["transcription", /transcri|subtitle|meeting|转写|字幕/i], ["text", /chat|bot|agent|token|text|文本|客服/i]];

function startEstimate(question) {
  track("estimate_started", {});
  chips.innerHTML = "";
  const hit = question && TYPE_WORDS.find(([, re]) => re.test(question));
  if (hit) return chooseType(hit[0], true);
  const btns = Object.entries(EST).map(([k, c]) => `<button class="btn secondary" type="button" data-etype="${k}">${c.label}</button>`).join("");
  bind(addMsg(`<p><b>Estimate my cost</b></p><p>What will you generate? I'll price it on a few models from the OceanToken catalog.</p><div class="actions">${btns}</div>`, "bot", "wide"));
  setChips([]);
}
function chooseType(type, quiet) {
  const c = EST[type];
  if (!quiet) addMsg(esc(c.label), "user");
  track("estimate_type", { type });
  const btns = c.templates.map((t) => `<button class="btn secondary" type="button" data-etpl="${type}:${t.id}">${esc(t.name)}</button>`).join("");
  bind(addMsg(`<p>${c.label}: pick the closest example. You can change every number on the estimate.</p><div class="actions">${btns}</div>`, "bot", "wide"));
  setChips([]);
}
function chooseTemplate(type, tplId) {
  const tpl = EST[type].templates.find((t) => t.id === tplId);
  addMsg(esc(tpl.name), "user");
  const card = addMsg("", "bot", "wide estimate");
  card.dataset.type = type; card.dataset.tpl = tplId; card.dataset.params = JSON.stringify(tpl.params);
  renderCard(card);
  const r = estimate(type, tpl.params);
  track("estimate_shown", { type, template: tplId, edited: false, out_of_range: r.out_of_range });
  asked.push(`Cost estimate: ${tpl.name} — ${assumptions(type, tpl, tpl.params)}`);
  setChips(["estimate"]);
}

function rowsHtml(type, tpl, r) {
  if (r.missing.length) {
    const names = r.missing.map((k) => EST[type].fields.find((f) => f[0] === k)[1]).join(", ");
    return `<p class="est-need">Enter a number for: ${esc(names)}.</p>`;
  }
  const [c1, c2, c3] = columns(type, tpl);
  const head = `<div class="est-n est-head"><small>${c1}</small><small>${c2}</small><small>${c3}</small></div>`;
  return head + r.rows.map((row) => {
    const name = `<a href="${row.page || DOCS + "/models"}" target="_blank" rel="noopener">${esc(row.model_id)}</a>`;
    if (row.state !== "ok") return `<div class="est-row off">${name}<div class="est-note">${esc(row.note)}</div></div>`;
    return `<div class="est-row">${name}<div class="est-n">
      <b>${usd(row.per_task)}</b><b>${usd(row.per_month)}</b><b>${row.per_10 == null ? "—" : approx(row.per_10)}</b></div></div>`;
  }).join("");
}
function renderCard(card, note) {
  const type = card.dataset.type, tpl = EST[type].templates.find((t) => t.id === card.dataset.tpl);
  const p = JSON.parse(card.dataset.params);
  const r = estimate(type, p);
  const stale = r.stale ? `<p class="est-stale">Prices may have changed since ${dateLabel(r.prices_as_of)}: check the <a href="${DOCS}/models" target="_blank" rel="noopener">Models page</a>.</p>` : "";
  const volume = r.out_of_range ? `<button class="btn secondary" type="button" data-evol="1">Talk to us about volume pricing</button>` : "";
  card.innerHTML = `<p><b>Estimate · ${esc(tpl.name)}</b>${note ? ` <span class="est-updated">${note}</span>` : ""}</p>
    <p class="est-a">${esc(assumptions(type, tpl, p))}</p>
    <div class="est-slot"></div>
    <div class="est-rows">${rowsHtml(type, tpl, r)}</div>
    <p class="est-f">Prices as of ${dateLabel(r.prices_as_of)} from the OceanToken model catalog. ${FOOT_NOTE[type]} This is an estimate, not a quote: you're billed for actual usage.</p>${stale}
    <div class="actions"><button class="btn secondary" type="button" data-echange="1">Change inputs</button><a class="btn primary" href="${SIGNUP_URL}" target="_blank" rel="noopener" data-ekey="1">Get API key ↗</a>${volume}</div>`;
  wireCard(card);
}
// Inputs open right under the assumptions line, above the results, with an explicit Update button.
function inputForm(card) {
  const type = card.dataset.type, p = JSON.parse(card.dataset.params);
  const form = document.createElement("form");
  form.className = "est-form";
  form.noValidate = true;
  form.innerHTML = EST[type].fields.map(([k, label, step]) =>
    `<label>${esc(label)}<input type="number" min="0" step="${step}" data-k="${k}" value="${p[k]}"></label>`).join("") +
    `<p class="est-need" hidden></p><div class="actions est-form-actions"><button class="btn primary" type="submit">Update estimate</button><button class="btn secondary" type="button" data-ecancel="1">Cancel</button></div>`;
  form.onsubmit = (e) => {
    e.preventDefault();
    const next = {};
    form.querySelectorAll("input").forEach((el) => { next[el.dataset.k] = el.value === "" ? NaN : Number(el.value); });
    const missing = missingParams(type, next);
    form.querySelectorAll("input").forEach((el) => el.classList.toggle("bad", missing.includes(el.dataset.k)));
    if (missing.length) {  // ESTIMATE_NEEDS_INFO: say which number is missing, keep the old result
      const msg = form.querySelector(".est-need");
      msg.textContent = "Enter a number (0 or more) for: " + missing.map((k) => EST[type].fields.find((f) => f[0] === k)[1]).join(", ") + ".";
      msg.hidden = false;
      return;
    }
    card.dataset.params = JSON.stringify(next);
    // Keep the hand-off context current: replace this card's earlier summary with the new numbers.
    const tplNow = EST[type].templates.find((x) => x.id === card.dataset.tpl);
    const summary = `Cost estimate: ${tplNow.name} — ${assumptions(type, tplNow, next)}`;
    const prev = asked.findIndex((q) => q.startsWith(`Cost estimate: ${tplNow.name} — `));
    if (prev >= 0) asked.splice(prev, 1);
    asked.push(summary);
    renderCard(card, "Updated");
    const r = estimate(type, next);
    track("estimate_shown", { type, template: card.dataset.tpl, edited: true, out_of_range: r.out_of_range });
    pinTo(card);
  };
  form.querySelector("[data-ecancel]").onclick = () => { form.remove(); card.querySelector("[data-echange]").hidden = false; };
  return form;
}
function wireCard(card) {
  bind(card);
  const ch = card.querySelector("[data-echange]");
  ch.onclick = () => {
    if (card.querySelector(".est-form")) return;
    card.querySelector(".est-slot").appendChild(inputForm(card));
    ch.hidden = true;
    pinTo(card);
    card.querySelector(".est-form input").focus();
  };
  const key = card.querySelector("[data-ekey]");
  if (key) key.onclick = () => track("estimate_key_clicked", { type: card.dataset.type });
  const vol = card.querySelector("[data-evol]");
  if (vol) vol.onclick = () => {
    const tpl = EST[card.dataset.type].templates.find((t) => t.id === card.dataset.tpl);
    asked.push(`Volume pricing for: ${tpl.name} — ${assumptions(card.dataset.type, tpl, JSON.parse(card.dataset.params))}`);
    track("estimate_volume_handoff", { type: card.dataset.type });
    openTalkToUs();
  };
}

function setChips(ids) {
  chips.innerHTML = "";
  ids.forEach((id) => {
    const e = KB.find((x) => x.id === id);
    const b = document.createElement("button");
    b.className = "chip"; b.type = "button"; b.textContent = e.title;
    b.onclick = () => ask(e.title, e.id);
    chips.appendChild(b);
  });
  const more = document.createElement("button");
  more.className = "chip more"; more.type = "button"; more.textContent = "More questions";
  more.onclick = showMore;
  chips.appendChild(more);
}

function respond(question, forcedId) {
  // Guardrail: never accept secrets.
  if (KEY_PATTERN.test(question)) {
    track("answer", { state: "SECRET_BLOCKED" });
    addMsg(`<p>That looks like it might contain an API key, so I didn't keep it. Please don't paste keys here. If it was a real key, rotate it under API Keys in the console, or delete it right away if it's being misused.</p>`, "bot", "warn");
    return setChips(["leak", "human"]);
  }
  const ranked = forcedId ? [{ e: KB.find((x) => x.id === forcedId), s: 99 }] : score(question);
  const top = ranked[0];

  if (top && top.s >= ANSWER_MIN) {
    track("answer", { state: top.e.gap ? "KNOWN_GAP" : "ANSWER", id: top.e.id, score: top.s, question: top.e.gap ? question : undefined });
    if (top.e.action === "estimate") return startEstimate(forcedId ? "" : question);
    bind(addMsg(top.e.a + sourcesHtml(top.e.src)));
    if (top.e.handoff) return handoff(top.e.id);
    const related = ranked.slice(1).filter((r) => !r.e.gap).slice(0, 2).map((r) => r.e.id);
    return setChips(related.length ? related : STARTERS.filter((id) => id !== top.e.id).slice(0, 3));
  }
  if (top && top.s >= SUGGEST_MIN) {
    track("answer", { state: "LOW_CONFIDENCE", candidates: ranked.slice(0, 3).map((r) => r.e.id) });
    addMsg(`<p>I'm not sure I understood. Did you mean one of these?</p>`);
    return setChips(ranked.filter((r) => !r.e.gap).slice(0, 3).map((r) => r.e.id));
  }
  track("answer", { state: "NO_ANSWER" });
  bind(addMsg(`<p>I can only answer questions about OceanToken: setup, pricing, models, limits and your account. I don't have an answer for that one.</p><p>Try the FAQ, or a person can help.</p><div class="actions">${faqLink("no_answer")}${personBtn("no_answer")}</div>`));
  setChips([]);  // keep the FAQ / person buttons in view
}

function ask(text, forcedId) {
  const clean = text.trim();
  if (!clean) return;
  // Don't echo a pasted key back into the transcript.
  const secret = KEY_PATTERN.test(clean);
  addMsg(secret ? "••••••" : esc(clean), "user");
  if (!secret && !forcedId) asked.push(clean.slice(0, 300));
  track("question_asked", { length: clean.length, via: forcedId ? "chip" : "typed" });
  chips.innerHTML = "";
  const typing = addMsg(`<span class="typing">Looking in the docs…</span>`);
  setTimeout(() => { typing.remove(); respond(clean, forcedId); }, 450);
}

function openPanel() {
  panel.classList.add("open"); launcher.setAttribute("aria-expanded", "true");
  if (!log.children.length) {
    addMsg(`<p>Hi! I answer questions about OceanToken from the docs, with a link to the page each answer comes from.</p>`);
    setChips(STARTERS);
  }
  track("assistant_opened", { page: location.pathname });
  input.focus();
}
function closePanel() { panel.classList.remove("open"); launcher.setAttribute("aria-expanded", "false"); launcher.focus(); }

// Back from the FAQ tab: ask once whether it answered the question; if not, offer a person.
window.addEventListener("focus", () => {
  if (!faqVisited || faqNudged || !panel.classList.contains("open")) return;
  faqNudged = true;
  track("faq_returned", {});
  bind(addMsg(`<p>Welcome back. Did the FAQ answer your question?</p><div class="actions"><button class="btn secondary" type="button" data-done="1">Yes, thanks</button>${personBtn("faq_return")}</div>`));
});

launcher.onclick = openPanel;
$("close").onclick = closePanel;
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && panel.classList.contains("open")) closePanel(); });
$("form").onsubmit = (e) => { e.preventDefault(); ask(input.value); input.value = ""; };

window.OceanTokenAssistant = { open: openPanel, close: closePanel, ask, score, KB, KEY_PATTERN, ANSWER_MIN, SUGGEST_MIN, showMore, handoff, GROUPS, estimate, EST, startEstimate };
}

if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);
})();
