'use strict';

const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const aiConfig = require('../config/ai');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    if (!aiConfig.gemini.apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    this.genAI = new GoogleGenerativeAI(aiConfig.gemini.apiKey);
    this.model = aiConfig.gemini.model;
    this.generationConfig = aiConfig.gemini.generationConfig;
  }

  /**
   * Build a structured system prompt from business config
   * @param {Object} businessConfig
   * @returns {string}
   */
  _buildSystemPrompt(businessConfig) {
    const { businessName, description, uiFlowTree, chatbotName, language } = businessConfig;

    const flattenNodes = (nodes, depth = 0) => {
      let result = '';
      for (const node of nodes) {
        const indent = '  '.repeat(depth);
        result += `${indent}- [ID: ${node.id}] ${node.label}`;
        if (node.description) result += `: ${node.description}`;
        if (node.path) result += ` (path: ${node.path})`;
        if (node.action) result += ` (action: ${node.action})`;
        result += '\n';
        if (node.children && node.children.length > 0) {
          result += flattenNodes(node.children, depth + 1);
        }
      }
      return result;
    };

    const uiFlowText =
      uiFlowTree && uiFlowTree.length > 0
        ? flattenNodes(uiFlowTree)
        : 'No UI flow tree defined.';

    const languageInstruction =
      language === 'auto'
        ? 'Always respond in the same language the user writes in.'
        : `Always respond in ${language}.`;

    return `You are ${chatbotName || 'AI Assistant'}, an intelligent assistant for "${businessName}".

## Your Role
You help users navigate the website, answer questions, and guide them to the right sections based on their needs.

## Business Context
${description}

## Website Navigation (UI Flow Tree)
The following nodes represent the website's structure. Each node has an ID you can reference in suggestions:
${uiFlowText}

## Response Format Rules (CRITICAL)
You MUST always respond in valid JSON format only. No extra text outside JSON.

If you can suggest a navigation or action, respond with:
{
  "message": "Your helpful response here",
  "suggestion": {
    "type": "navigate",
    "target": "node_id_here"
  }
}

If you can suggest an action (form submission, click, etc.), respond with:
{
  "message": "Your helpful response here",
  "suggestion": {
    "type": "action",
    "target": "node_id_here"
  }
}

If no suggestion is relevant, respond with:
{
  "message": "Your helpful response here"
}

## Behavior Guidelines
1. ONLY answer based on the provided business context and UI flow tree.
2. Do NOT hallucinate information not in the business context.
3. If unsure, honestly say you don't have that information.
4. Be concise, friendly, and professional.
5. ${languageInstruction}
6. Always suggest the most relevant navigation node when applicable.
7. Do NOT include any markdown, code blocks, or extra text — PURE JSON only.`;
  }

  /**
   * Build conversation history in Gemini format
   * @param {Array} messages
   * @returns {Array}
   */
  _buildHistory(messages) {
    return messages.slice(0, -1).map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));
  }

  /**
   * Parse AI response safely
   * @param {string} rawText
   * @returns {Object}
   */
  _parseResponse(rawText) {
    try {
      // Strip potential markdown code blocks
      const cleaned = rawText
        .trim()
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '');

      const parsed = JSON.parse(cleaned);

      // Validate structure
      if (typeof parsed.message !== 'string') {
        throw new Error('Missing message field');
      }

      const result = { message: parsed.message };

      if (parsed.suggestion && parsed.suggestion.type && parsed.suggestion.target) {
        if (['navigate', 'action'].includes(parsed.suggestion.type)) {
          result.suggestion = {
            type: parsed.suggestion.type,
            target: parsed.suggestion.target,
          };
        }
      }

      return result;
    } catch (err) {
      logger.warn('Failed to parse AI JSON response, using raw text:', err.message);
      // Fallback: return raw text as message
      return { message: rawText.trim() };
    }
  }

  /**
   * Generate AI response for a chat message
   * @param {Object} params
   * @param {string} params.userMessage
   * @param {Object} params.businessConfig
   * @param {Array}  params.conversationHistory
   * @returns {Promise<{message: string, suggestion?: Object}>}
   */
  async generateResponse({ userMessage, businessConfig, conversationHistory = [] }) {
    try {
      const model = this.genAI.getGenerativeModel({
        model: this.model,
        generationConfig: this.generationConfig,
        safetySettings: aiConfig.gemini.safetySettings,
        systemInstruction: this._buildSystemPrompt(businessConfig),
      });

      const history = this._buildHistory(conversationHistory);

      const chat = model.startChat({ history });

      const result = await chat.sendMessage(userMessage);
      const rawText = result.response.text();

      logger.debug('Raw AI response:', rawText);

      return this._parseResponse(rawText);
    } catch (error) {
      logger.error('AI generation error:', error);
      throw error;
    }
  }
}

// Singleton instance
module.exports = new AIService();
