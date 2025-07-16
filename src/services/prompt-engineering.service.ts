import { Injectable, Logger } from '@nestjs/common';

export interface PromptTemplate {
  systemPrompt: string;
  contextPrompt: string;
  userPrompt: string;
  responseFormat: string;
}

@Injectable()
export class PromptEngineeringService {
  private readonly logger = new Logger(PromptEngineeringService.name);

  /**
   * CBT 상담을 위한 기본 시스템 프롬프트
   */
  private readonly CBT_SYSTEM_PROMPT = `
당신은 전문적인 CBT(인지행동치료) 상담사입니다. 다음 원칙을 따라 상담을 진행해주세요:

1. **공감적 이해**: 사용자의 감정과 상황을 깊이 이해하고 공감을 표현하세요
2. **인지 재구성**: 부정적인 사고 패턴을 인식하고 더 건설적인 관점을 제시하세요
3. **행동 변화**: 구체적이고 실현 가능한 행동 전략을 제안하세요
4. **단계적 접근**: 급하게 해결하려 하지 말고 단계적으로 접근하세요
5. **자기효능감 증진**: 사용자가 자신의 능력을 믿을 수 있도록 도와주세요

상담 스타일:
- 따뜻하고 지지적인 톤을 유지하세요
- 전문적이면서도 친근한 언어를 사용하세요
- 구체적인 예시와 실습 방법을 제시하세요
- 사용자의 진행 상황을 정기적으로 점검하세요
`;

  /**
   * 컨텍스트를 포함한 프롬프트 템플릿 생성
   */
  createContextualPrompt(
    currentMessage: string,
    conversationHistory: Array<{ role: string; content: string }>,
    emotionContext?: any
  ): PromptTemplate {
    const systemPrompt = this.CBT_SYSTEM_PROMPT;
    const contextPrompt = this.formatConversationHistory(conversationHistory);
    const userPrompt = this.formatCurrentMessage(currentMessage, emotionContext);
    const responseFormat = this.getResponseFormat();

    return {
      systemPrompt,
      contextPrompt,
      userPrompt,
      responseFormat,
    };
  }

  /**
   * 대화 히스토리를 프롬프트 형식으로 변환
   */
  private formatConversationHistory(history: Array<{ role: string; content: string }>): string {
    if (history.length === 0) {
      return '';
    }

    let contextPrompt = '\n\n=== 이전 대화 내용 ===\n';
    
    for (const message of history) {
      const roleLabel = message.role === 'user' ? '사용자' : '상담사';
      contextPrompt += `[${roleLabel}]: ${message.content}\n`;
    }

    contextPrompt += '\n=== 현재 대화 ===\n';
    return contextPrompt;
  }

  /**
   * 현재 메시지를 프롬프트 형식으로 변환
   */
  private formatCurrentMessage(message: string, emotionContext?: any): string {
    let userPrompt = `현재 사용자 메시지: ${message}`;

    if (emotionContext) {
      userPrompt += `\n\n감정 컨텍스트 정보:`;
      
      if (emotionContext.currentEmotion) {
        userPrompt += `\n- 현재 감정 상태: ${emotionContext.currentEmotion}`;
      }
      
      if (emotionContext.emotionHistory?.length > 0) {
        userPrompt += `\n- 감정 변화 히스토리: ${emotionContext.emotionHistory.join(' → ')}`;
      }
      
      if (emotionContext.confidence) {
        userPrompt += `\n- 감정 분석 신뢰도: ${emotionContext.confidence}`;
      }
    }

    return userPrompt;
  }

  /**
   * 응답 형식 정의
   */
  private getResponseFormat(): string {
    return `
다음 JSON 형식으로 응답해주세요:

{
  "content": "상담사 응답 내용 (이전 대화 맥락을 고려한 연속성 있는 응답)",
  "emotionAnalysis": {
    "primaryEmotion": "감지된 주요 감정",
    "confidence": 0.95,
    "suggestions": ["CBT 기법 제안들 (이전 내용과 연결된 구체적인 조언)"],
    "contextualNotes": "이전 대화와의 연결점 및 진행 상황"
  },
  "therapeuticApproach": {
    "technique": "사용된 CBT 기법",
    "rationale": "이 기법을 선택한 이유",
    "nextSteps": "다음 단계 제안"
  }
}

응답 시 다음 사항을 고려하세요:
1. 이전 대화 내용을 참고하여 연속성 있는 응답을 제공하세요
2. 사용자의 감정 변화와 진행 상황을 파악하세요
3. 이전에 언급된 내용과 연결하여 조언을 제공하세요
4. 자연스럽고 공감적인 톤을 유지하세요
5. 구체적이고 실현 가능한 제안을 포함하세요
`;
  }

  /**
   * 전체 프롬프트 조합
   */
  buildCompletePrompt(template: PromptTemplate): string {
    let completePrompt = template.systemPrompt;
    
    if (template.contextPrompt) {
      completePrompt += template.contextPrompt;
    }
    
    completePrompt += '\n' + template.userPrompt;
    completePrompt += '\n' + template.responseFormat;
    
    return completePrompt;
  }

  /**
   * 감정 분석을 위한 특화 프롬프트
   */
  createEmotionAnalysisPrompt(content: string, mediaType?: string): string {
    let prompt = `
당신은 감정 분석 전문가입니다. 다음 내용을 분석하여 감정 상태를 파악해주세요.

분석 대상: ${content}
`;

    if (mediaType) {
      prompt += `미디어 타입: ${mediaType}\n`;
    }

    prompt += `
다음 JSON 형식으로 응답해주세요:

{
  "primaryEmotion": "주요 감정 (예: 기쁨, 슬픔, 분노, 불안, 중립 등)",
  "secondaryEmotions": ["보조 감정들"],
  "confidence": 0.95,
  "intensity": 0.8,
  "triggers": ["감정을 유발한 요인들"],
  "suggestions": ["감정 관리 방법 제안"],
  "riskLevel": "low|medium|high"
}

감정 분석 시 다음을 고려하세요:
1. 언어적 표현과 톤을 종합적으로 분석하세요
2. 문화적 맥락을 고려하세요
3. 감정의 강도와 지속성을 평가하세요
4. 위험 신호가 있는지 확인하세요
`;

    return prompt;
  }

  /**
   * 대화 요약을 위한 프롬프트
   */
  createSummaryPrompt(messages: Array<{ role: string; content: string }>): string {
    const conversationText = messages
      .map(msg => `[${msg.role === 'user' ? '사용자' : '상담사'}]: ${msg.content}`)
      .join('\n');

    return `
다음 대화 내용을 요약해주세요:

${conversationText}

다음 JSON 형식으로 응답해주세요:

{
  "summary": "대화의 주요 내용 요약",
  "keyTopics": ["주요 주제들"],
  "emotionalProgress": "감정적 진행 상황",
  "therapeuticGoals": ["치료 목표"],
  "nextSessionFocus": "다음 세션에서 집중할 점"
}

요약 시 다음을 고려하세요:
1. 대화의 핵심 내용을 간결하게 정리하세요
2. 감정적 변화와 진행 상황을 파악하세요
3. 치료적 목표와 성과를 평가하세요
4. 다음 세션을 위한 제안을 포함하세요
`;
  }

  /**
   * 긴급 상황 감지를 위한 프롬프트
   */
  createCrisisDetectionPrompt(content: string): string {
    return `
다음 내용에서 위험 신호나 긴급 상황을 감지해주세요:

${content}

다음 JSON 형식으로 응답해주세요:

{
  "crisisDetected": true/false,
  "riskLevel": "low|medium|high|critical",
  "warningSigns": ["감지된 위험 신호들"],
  "immediateActions": ["즉시 취해야 할 조치들"],
  "professionalHelp": "전문가 상담 필요 여부",
  "response": "적절한 응답 내용"
}

위험 신호 감지 기준:
1. 자해나 자살 관련 언급
2. 극단적인 감정 표현
3. 폭력적이거나 위험한 행동 계획
4. 심각한 정신 건강 문제 징후
5. 사회적 고립이나 절망감 표현
`;
  }
} 