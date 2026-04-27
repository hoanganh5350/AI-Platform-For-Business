'use strict';

const { GoogleGenAI } = require('@google/genai');
const aiConfig = require('../config/ai');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    if (!aiConfig.gemini.apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    this.ai = new GoogleGenAI({ apiKey: aiConfig.gemini.apiKey });
    this.model = aiConfig.gemini.model;
    this.generationConfig = aiConfig.gemini.generationConfig;
  }

  // ─── UI Flow Tree Formatter ─────────────────────────────────────────────────

  /**
   * Format UI flow tree nodes into a structured text block for the prompt.
   * Supports both v2 (name/url/actionType/parentId) and v1 (label/path/action) schemas.
   * @param {Array} nodes
   * @param {number} depth
   * @returns {string}
   */
  _formatUIFlowTree(nodes, depth = 0) {
    if (!nodes || nodes.length === 0) return '';
    let result = '';
    const indent = '  '.repeat(depth);

    for (const node of nodes) {
      const displayName = node.name || node.label || node.id;
      const route = node.url || node.path || '';
      const actionType = node.actionType || (node.action ? 'action' : 'navigate');
      const desc = node.description ? ` — ${node.description}` : '';
      const routeStr = route ? ` | url: ${route}` : '';
      const parentStr = node.parentId ? ` | parentId: ${node.parentId}` : '';
      const actionStr = node.action ? ` | action: ${node.action}` : '';

      result += `${indent}• id: "${node.id}" | name: "${displayName}" | actionType: ${actionType}${routeStr}${parentStr}${desc}${actionStr}\n`;

      if (node.children && node.children.length > 0) {
        result += this._formatUIFlowTree(node.children, depth + 1);
      }
    }
    return result;
  }

  // ─── System Prompt Builder ──────────────────────────────────────────────────

  /**
   * Build the full admin-driven system prompt using the v2 template.
   * @param {Object} config - Full business config document
   * @returns {string}
   */
  _buildSystemPrompt(config) {
    const {
      businessId,
      businessName,
      industry,
      description,
      contact,
      website,
      tone,
      uiFlowTree,
      chatbotName,
      language,
    } = config;

    const uiFlowText =
      uiFlowTree && uiFlowTree.length > 0
        ? this._formatUIFlowTree(uiFlowTree)
        : 'No UI flow tree defined by Admin.';

    const languageRule =
      language === 'auto'
        ? 'Match the SAME language the user writes in. If user writes Vietnamese → respond in Vietnamese. If English → English. Etc.'
        : `Always respond in ${language} regardless of user language.`;

    const toneDesc = {
      professional: 'Use professional, clear, and precise language.',
      friendly: 'Use warm, approachable, and friendly language.',
      casual: 'Use casual, relaxed, everyday language.',
      formal: 'Use highly formal, structured, and polished language.',
      neutral: 'Use neutral, balanced, and objective language.',
    }[tone || 'professional'] || 'Use professional language.';

    return `You are ${chatbotName || 'AI Assistant'}, an intelligent chatbot assistant operating on a multi-tenant enterprise platform.

You are currently acting as the AI assistant for a specific business configured by the Admin.
Your ENTIRE behavior — knowledge, tone, navigation, and scope — is defined by what the Admin has configured.

========================
🏢 BUSINESS CONFIG (FROM ADMIN)
========================

Business ID: ${businessId}
Business Name: ${businessName}
Industry: ${industry || 'Not specified'}
Description: ${description}
Contact: ${contact || 'Not specified'}
Website: ${website || 'Not specified'}
Tone: ${tone || 'professional'}

========================
⚙️ ADMIN CONFIGURATION CONTEXT
========================

This chatbot is DYNAMICALLY configured by Admin.
Admin has defined:
1. Business Description → your knowledge base
2. UI Flow Tree → your navigation guide

CRITICAL: Treat the Admin config as your ONLY source of truth.
Different businessId = completely different AI behavior.

========================
🌐 UI FLOW TREE (ADMIN DEFINED)
========================

Each node below represents a real page, feature, or action on the website.
Node fields: id | name | actionType (navigate/action/info) | url | parentId | description

${uiFlowText}

When a user asks about a topic, MAP their intent to the MOST RELEVANT node.
Priority: exact match → closest parent → root fallback.
Return the node's id as the suggestion target.

========================
🎯 YOUR OBJECTIVES
========================

1. Understand the user's intent precisely.
2. Answer ONLY based on the Business Config above — never go outside this scope.
3. Use the UI Flow Tree to guide the user to the right page or action.
4. Always suggest a next action when a relevant UI node exists.
5. ${toneDesc}

========================
📦 RESPONSE FORMAT (STRICT — OUTPUT JSON ONLY)
========================

RULE: Your ENTIRE response must be a single valid JSON object. No markdown. No explanation. No text outside JSON.

When a UI node matches the user's intent:
{
  "message": "Your helpful response based on business context",
  "suggestion": {
    "type": "navigate",
    "target": "exact_node_id",
    "label": "Short call-to-action text (e.g. View Products)"
  }
}

When user needs to trigger an action (form, modal, button):
{
  "message": "Your helpful response",
  "suggestion": {
    "type": "action",
    "target": "exact_node_id",
    "label": "Short action label (e.g. Open Contact Form)"
  }
}

When no UI node is relevant, or it is a simple informational answer:
{
  "message": "Your concise answer here"
}

========================
🧠 BEHAVIOR RULES
========================

1. SCOPE ENFORCEMENT — Never answer outside business scope.
   If the user asks something unrelated, respond EXACTLY:
   {"message": "Xin lỗi, tôi chỉ hỗ trợ thông tin liên quan đến ${businessName}."}
   (or in the user's language if not Vietnamese)

2. NO HALLUCINATION
   - Never invent products, services, prices, URLs, or features not in the config.
   - If unsure → say you don't have that info and suggest contact: ${contact || 'the business contact'}.

3. CONCISENESS — Keep messages short and actionable. No long paragraphs.

4. LANGUAGE — ${languageRule}

5. TONE — ${toneDesc}

6. GREETINGS — If user says hi/hello/xin chào → respond warmly, NO suggestion needed.

7. UNCLEAR INTENT — If intent is ambiguous:
   - Ask one clarifying question.
   - Optionally list 2–3 relevant options from the UI flow.

8. INTENT MAPPING — When user intent matches a UI node:
   - You MUST return a suggestion with the correct node id.
   - Use the node's name as the label (or create a short CTA).

9. INCOMPLETE UI FLOW — If no matching node exists:
   - Answer with message only, no suggestion.

10. NODE WITH NO URL — Still suggest using node id. Frontend handles routing.

========================
💡 EXAMPLES
========================

User: "Tôi muốn mua sản phẩm"
→ {"message": "Bạn có thể xem và mua sản phẩm tại trang sản phẩm của chúng tôi.", "suggestion": {"type": "navigate", "target": "product_page", "label": "Xem sản phẩm"}}

User: "Hello"
→ {"message": "Hello! How can I help you today?"}

User: "Giá vàng hôm nay"
→ {"message": "Xin lỗi, tôi chỉ hỗ trợ thông tin liên quan đến ${businessName}."}

User: "I want to contact sales"
→ {"message": "I can connect you with our sales team right away.", "suggestion": {"type": "action", "target": "contact_page", "label": "Contact Sales"}}

========================
🚀 FINAL RULE
========================

OUTPUT ONLY JSON. No markdown. No code blocks. No extra text. Always valid JSON.`;
  }

  // ─── History Builder ────────────────────────────────────────────────────────

  /**
   * Convert internal chat history to @google/genai format.
   * Excludes the current user message (sent separately).
   */
  _buildHistory(messages) {
    // Exclude last message (current user input)
    return messages.slice(0, -1).map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));
  }

  // ─── Response Parser ────────────────────────────────────────────────────────

  /**
   * Safely parse AI response JSON.
   * Handles: markdown wrappers, extra whitespace, partial JSON.
   * Extracts: message, suggestion (type, target, label).
   */
  _parseResponse(rawText) {
    try {
      // Strip markdown code fences if present
      const cleaned = rawText
        .trim()
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '');

      const parsed = JSON.parse(cleaned);

      if (typeof parsed.message !== 'string') {
        throw new Error('Missing or invalid message field in AI response');
      }

      const result = { message: parsed.message };

      // Parse suggestion block
      if (
        parsed.suggestion &&
        typeof parsed.suggestion.type === 'string' &&
        typeof parsed.suggestion.target === 'string'
      ) {
        if (['navigate', 'action'].includes(parsed.suggestion.type)) {
          result.suggestion = {
            type: parsed.suggestion.type,
            target: parsed.suggestion.target,
          };
          // v2: include label if present
          if (typeof parsed.suggestion.label === 'string' && parsed.suggestion.label.trim()) {
            result.suggestion.label = parsed.suggestion.label.trim();
          }
        }
      }

      return result;
    } catch (err) {
      logger.warn(`AI response parse error: ${err.message}. Raw: ${rawText.substring(0, 200)}`);
      // Graceful fallback — return raw text as plain message
      return { message: rawText.trim() };
    }
  }

  // ─── Main Entry Point ───────────────────────────────────────────────────────

  /**
   * Generate an AI response using the new @google/genai SDK.
   *
   * @param {Object}  params
   * @param {string}  params.userMessage
   * @param {Object}  params.businessConfig
   * @param {Array}   params.conversationHistory
   */
  async generateResponse({ userMessage, businessConfig, conversationHistory = [] }) {
    try {
      const systemInstruction = this._buildSystemPrompt(businessConfig);
      const history = this._buildHistory(conversationHistory);

      logger.debug(`[AI] model=${this.model} | business=${businessConfig.businessId} | msg="${userMessage.substring(0, 80)}"`);

      const chat = this.ai.chats.create({
        model: this.model,
        config: {
          systemInstruction,
          temperature: this.generationConfig.temperature,
          topP: this.generationConfig.topP,
          maxOutputTokens: this.generationConfig.maxOutputTokens,
        },
        history,
      });

      const response = await chat.sendMessage({ message: userMessage });
      const rawText = response.text;

      logger.debug(`[AI] Raw: ${(rawText || '').substring(0, 200)}`);

      return this._parseResponse(rawText || '');
    } catch (error) {
      logger.error(`[AI] Generation error | business=${businessConfig.businessId} | ${error.message}`);
      throw error;
    }
  }
}

// Export as singleton
module.exports = new AIService();
