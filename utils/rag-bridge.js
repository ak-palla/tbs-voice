/**
 * JavaScript bridge for RAG components
 * Allows Node.js WebSocket server to access TypeScript RAG modules
 */

// Simple in-memory implementation for WebSocket server
class SimpleRAGOptimizer {
  async getOptimizedInstructions(supabase, query, limit = 5) {
    console.log(`🎯 [SIMPLE-RAG] Processing query: "${query.substring(0, 50)}..."`);
    
    try {
      // Try to get relevant instructions using direct Supabase query
      const { data: instructions, error } = await supabase
        .from('chatbot_instructions')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ [SIMPLE-RAG] Supabase error:', error);
        return [];
      }

      console.log(`✅ [SIMPLE-RAG] Found ${instructions?.length || 0} instructions`);
      return instructions || [];
    } catch (error) {
      console.error('❌ [SIMPLE-RAG] Error:', error);
      return [];
    }
  }

  analyzeQuery(query) {
    const queryLower = query.toLowerCase();
    
    // Check for organizational queries
    const organizationalPatterns = [
      'chain of command', 'organizational structure', 'hierarchy', 'leadership structure',
      'team structure', 'command structure', 'organization chart', 'reporting structure',
      'delegation', 'authority', 'management levels', 'organizational design',
      'team leadership', 'company structure', 'business hierarchy', 'roles and responsibilities',
      'resists', 'resistance', 'team resists', 'authority', 'management'
    ];
    
    const isOrganizational = organizationalPatterns.some(pattern => queryLower.includes(pattern));
    
    if (isOrganizational) {
      return {
        type: 'organizational',
        suggestedThreshold: 0.6,
        suggestedLimit: 4
      };
    }
    
    return {
      type: 'general',
      suggestedThreshold: 0.5,
      suggestedLimit: 5
    };
  }
}

class SimplePromptOptimizer {
  generateFinalPrompt(query, instructions, userContext, isVoiceQuery = false) {
    console.log(`📝 [SIMPLE-PROMPT] Generating ${isVoiceQuery ? 'VOICE-OPTIMIZED' : 'TEXT'} prompt for: "${query.substring(0, 50)}..."`);
    
    const queryLower = query.toLowerCase();
    
    // Detect if this is about resistance or implementation challenges
    const isResistanceQuery = queryLower.includes('resist') || 
                             queryLower.includes('resistance') || 
                             queryLower.includes('team resists') ||
                             queryLower.includes('pushback') ||
                             queryLower.includes('opposed') ||
                             queryLower.includes('against');

    let systemPrompt = `You are an expert business advisor specializing in organizational development and change management.`;
    
    if (isResistanceQuery) {
      systemPrompt += ` The user is facing team resistance to organizational changes. Provide specific, actionable advice for overcoming resistance and implementing change successfully.`;
    } else if (queryLower.includes('chain of command') || queryLower.includes('organizational')) {
      systemPrompt += ` You specialize in organizational design, leadership structures, and team management systems.`;
    }

    // 🎤 VOICE OPTIMIZATION: Add voice-specific constraints
    if (isVoiceQuery) {
      systemPrompt += ` 

IMPORTANT - VOICE RESPONSE REQUIREMENTS:
- Keep response under 300 words (for audio clarity)
- Use simple, conversational language
- Avoid complex bullet points and formatting
- Focus on 3-4 key actionable points maximum
- Speak naturally as if advising a colleague`;
    }

    let contextIntegration = '';
    if (instructions && instructions.length > 0) {
      // Limit context for voice responses
      const maxInstructions = isVoiceQuery ? 2 : instructions.length;
      contextIntegration = `Use these business insights to inform your response:\n\n`;
      instructions.slice(0, maxInstructions).forEach((instruction, index) => {
        contextIntegration += `**Source ${index + 1}:**\n`;
        contextIntegration += `Title: ${instruction.title}\n`;
        contextIntegration += `Content: ${instruction.content}\n\n`;
      });
    }

    let responseFormat = '';
    if (isVoiceQuery) {
      // Simplified format for voice but still well-structured
      responseFormat = `CRITICAL: Even for voice responses, use proper formatting:

### ⚠️ VOICE FORMATTING RULES:
- **Never** use "First, Second, Third, Finally" in running sentences
- **Always** use numbered lists (1. 2. 3.) for action steps
- **Always** use bullet points (-) for related items
- Keep response under 300 words for audio clarity
- Use simple, conversational language
- Focus on 3-4 key actionable points maximum

### ✅ GOOD VOICE FORMAT EXAMPLE:
"Let's tackle this effectively:

1. **First Action**
   Clear, specific instruction

2. **Second Action** 
   Next logical step

3. **Third Action**
   Final implementation step

This approach will help you achieve your goal."

Provide a concise, conversational response following this structure.`;
    } else if (isResistanceQuery) {
      responseFormat = `CRITICAL: You must follow these formatting requirements:

### ⚠️ FORMATTING RULES TO FOLLOW:
- **Never** write wall-of-text responses without breaks
- **Never** use "First, Second, Third, Finally" in running sentences
- **Always** use proper markdown headings and formatting
- **Always** provide numbered steps for processes
- **Always** use bullet points for lists of related items
- **Always** bold important concepts and key terms
- **Always** end with clear next steps or call-to-action

Structure your response specifically for handling resistance:

## 🎯 Understanding Resistance
*Why people resist change and core factors*

## 🔄 Implementation Strategy

1. **Communication Approach**
   How to explain the change effectively

2. **Involvement & Buy-in** 
   Getting team members involved in the process

3. **Gradual Implementation**
   Phased approach to reduce resistance

4. **Address Concerns**
   Handle specific objections and fears

## 🚀 Next Steps
*Immediate actions to begin overcoming resistance*

Focus on practical, empathetic approaches that respect team concerns while achieving organizational goals.`;
    } else {
      responseFormat = `CRITICAL: You must follow these formatting requirements:

### ⚠️ FORMATTING RULES TO FOLLOW:
- **Never** write wall-of-text responses without breaks
- **Never** use "First, Second, Third, Finally" in running sentences
- **Always** use proper markdown headings and formatting
- **Always** break up content into scannable sections
- **Always** provide numbered steps for processes (use 1. 2. 3. format)
- **Always** use bullet points for lists of related items (use - or * format)
- **Always** bold important concepts and key terms
- **Always** end with clear next steps or call-to-action

### 🚫 AVOID THIS BAD FORMAT:
"Let's get this done. First, do this task and make sure it's complete. Second, move on to the next item and ensure quality."

### ✅ USE THIS GOOD FORMAT:
"Let's get this done effectively:

1. **Do This Task**
   Make sure it's complete and meets quality standards

2. **Move to Next Item** 
   Focus on ensuring quality throughout the process"

Provide a structured, actionable response with proper formatting and numbered steps.`;
    }

    return `${systemPrompt}

${contextIntegration}

${responseFormat}

USER QUERY: "${query}"

Provide a ${isVoiceQuery ? 'concise, conversational' : 'comprehensive, actionable'} response that directly addresses the user's specific situation.`;
  }

  analyzeQuery(query) {
    const queryLower = query.toLowerCase();
    
    // Detect organizational domain
    const organizationalWords = ['chain of command', 'organizational structure', 'hierarchy', 'leadership', 'team structure', 'command structure', 'delegation', 'authority', 'management levels', 'reporting', 'roles', 'responsibilities', 'resist', 'resistance'];
    
    let domain = 'general';
    if (organizationalWords.some(word => queryLower.includes(word))) {
      domain = 'organizational';
    }
    
    return { domain };
  }
}

// Export instances
const ragOptimizer = new SimpleRAGOptimizer();
const promptOptimizer = new SimplePromptOptimizer();

module.exports = {
  ragOptimizer,
  promptOptimizer
}; 