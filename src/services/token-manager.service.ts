import { Injectable, Logger } from '@nestjs/common';

export interface TokenInfo {
  estimatedTokens: number;
  maxTokens: number;
  isOverLimit: boolean;
  truncationNeeded: boolean;
}

@Injectable()
export class TokenManagerService {
  private readonly logger = new Logger(TokenManagerService.name);
  private readonly MAX_TOKENS = 800000; // Gemini 2.5-flash 토큰 제한의 80%
  private readonly SAFETY_MARGIN = 0.1; // 10% 안전 마진

  /**
   * 텍스트의 토큰 수를 추정
   */
  estimateTokens(text: string): number {
    if (!text) return 0;
    
    // 한국어 기준으로 대략적인 토큰 수 계산
    // 1 토큰 ≈ 4글자 (한국어)
    return Math.ceil(text.length / 4);
  }

  /**
   * 메시지 배열의 총 토큰 수를 계산
   */
  calculateTotalTokens(messages: Array<{ content: string }>): number {
    return messages.reduce((total, message) => {
      return total + this.estimateTokens(message.content);
    }, 0);
  }

  /**
   * 토큰 정보를 분석
   */
  analyzeTokens(currentTokens: number): TokenInfo {
    const maxAllowedTokens = Math.floor(this.MAX_TOKENS * (1 - this.SAFETY_MARGIN));
    
    return {
      estimatedTokens: currentTokens,
      maxTokens: maxAllowedTokens,
      isOverLimit: currentTokens > maxAllowedTokens,
      truncationNeeded: currentTokens > maxAllowedTokens * 0.8, // 80% 초과시 축소 고려
    };
  }

  /**
   * 긴 대화를 스마트하게 축소
   */
  smartTruncateMessages(
    messages: Array<{ role: string; content: string; timestamp?: Date }>,
    targetTokenCount: number
  ): Array<{ role: string; content: string; timestamp?: Date }> {
    if (messages.length === 0) return messages;

    const currentTokens = this.calculateTotalTokens(messages);
    if (currentTokens <= targetTokenCount) return messages;

    // 전략적 축소: 중요한 메시지들을 우선적으로 유지
    const truncatedMessages = this.strategicTruncation(messages, targetTokenCount);
    
    this.logger.log(`Messages truncated: ${messages.length} -> ${truncatedMessages.length} messages`);
    
    return truncatedMessages;
  }

  /**
   * 전략적 메시지 축소
   */
  private strategicTruncation(
    messages: Array<{ role: string; content: string; timestamp?: Date }>,
    targetTokenCount: number
  ): Array<{ role: string; content: string; timestamp?: Date }> {
    const result: Array<{ role: string; content: string; timestamp?: Date }> = [];
    let currentTokens = 0;

    // 1. 첫 번째 메시지 (대화 시작점) 항상 유지
    if (messages.length > 0) {
      result.push(messages[0]);
      currentTokens += this.estimateTokens(messages[0].content);
    }

    // 2. 최근 메시지들을 우선적으로 유지 (최대 10개)
    const recentMessages = messages.slice(-10);
    for (const message of recentMessages) {
      const messageTokens = this.estimateTokens(message.content);
      
      if (currentTokens + messageTokens <= targetTokenCount) {
        // 이미 첫 번째 메시지가 포함되어 있으면 중복 방지
        if (result.length === 0 || result[0] !== message) {
          result.push(message);
          currentTokens += messageTokens;
        }
      } else {
        break;
      }
    }

    // 3. 여전히 토큰 제한을 초과하면 메시지 내용을 축약
    if (currentTokens > targetTokenCount) {
      return this.summarizeMessages(result, targetTokenCount);
    }

    return result;
  }

  /**
   * 메시지 내용을 요약하여 토큰 수 줄이기
   */
  private summarizeMessages(
    messages: Array<{ role: string; content: string; timestamp?: Date }>,
    targetTokenCount: number
  ): Array<{ role: string; content: string; timestamp?: Date }> {
    const result: Array<{ role: string; content: string; timestamp?: Date }> = [];
    let currentTokens = 0;

    for (const message of messages) {
      let content = message.content;
      let messageTokens = this.estimateTokens(content);

      // 메시지가 너무 길면 축약
      if (currentTokens + messageTokens > targetTokenCount) {
        const maxAllowedLength = Math.floor((targetTokenCount - currentTokens) * 4); // 4글자 = 1토큰
        if (maxAllowedLength > 50) { // 최소 50글자는 유지
          content = content.substring(0, maxAllowedLength) + '...';
          messageTokens = this.estimateTokens(content);
        } else {
          continue; // 이 메시지는 건너뛰기
        }
      }

      result.push({ ...message, content });
      currentTokens += messageTokens;

      if (currentTokens >= targetTokenCount) break;
    }

    return result;
  }

  /**
   * 컨텍스트 윈도우 최적화
   */
  optimizeContextWindow(
    messages: Array<{ role: string; content: string; timestamp?: Date }>
  ): Array<{ role: string; content: string; timestamp?: Date }> {
    const tokenInfo = this.analyzeTokens(this.calculateTotalTokens(messages));
    
    if (tokenInfo.truncationNeeded) {
      this.logger.log(`Context window optimization needed. Current: ${tokenInfo.estimatedTokens}, Max: ${tokenInfo.maxTokens}`);
      return this.smartTruncateMessages(messages, tokenInfo.maxTokens);
    }

    return messages;
  }

  /**
   * 프롬프트 길이 검증
   */
  validatePromptLength(prompt: string): { isValid: boolean; estimatedTokens: number; maxTokens: number } {
    const estimatedTokens = this.estimateTokens(prompt);
    const maxTokens = this.MAX_TOKENS;
    
    return {
      isValid: estimatedTokens <= maxTokens,
      estimatedTokens,
      maxTokens,
    };
  }
} 