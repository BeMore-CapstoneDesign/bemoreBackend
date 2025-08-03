# 🎯 BeMore 감정 분석 API - 프론트엔드 통합 가이드

## 📋 목차
1. [API 개요](#api-개요)
2. [기본 설정](#기본-설정)
3. [감정 분석 API 사용법](#감정-분석-api-사용법)
4. [데이터 구조](#데이터-구조)
5. [실제 사용 예시](#실제-사용-예시)
6. [에러 처리](#에러-처리)
7. [성능 최적화](#성능-최적화)

---

## 🚀 API 개요

BeMore 감정 분석 API는 **VAD (Valence-Arousal-Dominance) 모델**을 기반으로 텍스트, 음성, 얼굴 표정을 분석하여 사용자의 감정 상태를 정확하게 파악합니다.

### 지원하는 분석 모드
- 📝 **텍스트 감정 분석**: 사용자 입력 텍스트 분석
- 🎤 **음성 톤 분석**: 오디오 파일 분석  
- 😊 **얼굴 표정 분석**: 이미지 파일 분석
- 🔄 **멀티모달 통합 분석**: 여러 모달리티 동시 분석

---

## ⚙️ 기본 설정

### Base URL
```javascript
const API_BASE_URL = 'http://localhost:3000/emotion';
```

### Content-Type
```javascript
// JSON 요청
headers: {
  'Content-Type': 'application/json'
}

// 파일 업로드
headers: {
  'Content-Type': 'multipart/form-data'
}
```

---

## 🎯 감정 분석 API 사용법

### 1. 텍스트 감정 분석

```javascript
/**
 * 텍스트 기반 감정 분석
 * @param {string} text - 분석할 텍스트
 * @returns {Promise<TextAnalysisResult>}
 */
async function analyzeTextEmotion(text) {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze/text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text })
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message);
    }

    return result.data;
  } catch (error) {
    console.error('텍스트 감정 분석 실패:', error);
    throw error;
  }
}

// 사용 예시
const textResult = await analyzeTextEmotion("오늘 정말 기분이 좋아요!");
console.log('감정 분석 결과:', textResult);
```

### 2. 얼굴 표정 분석

```javascript
/**
 * 얼굴 표정 분석
 * @param {File} imageFile - 분석할 이미지 파일
 * @returns {Promise<FacialAnalysisResult>}
 */
async function analyzeFacialExpression(imageFile) {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${API_BASE_URL}/analyze/facial`, {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message);
    }

    return result.data;
  } catch (error) {
    console.error('얼굴 표정 분석 실패:', error);
    throw error;
  }
}

// 사용 예시
const fileInput = document.getElementById('imageInput');
const imageFile = fileInput.files[0];
const facialResult = await analyzeFacialExpression(imageFile);
console.log('얼굴 분석 결과:', facialResult);
```

### 3. 음성 톤 분석

```javascript
/**
 * 음성 톤 분석
 * @param {File} audioFile - 분석할 오디오 파일
 * @returns {Promise<VoiceAnalysisResult>}
 */
async function analyzeVoiceTone(audioFile) {
  try {
    const formData = new FormData();
    formData.append('audio', audioFile);

    const response = await fetch(`${API_BASE_URL}/analyze/voice`, {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message);
    }

    return result.data;
  } catch (error) {
    console.error('음성 분석 실패:', error);
    throw error;
  }
}

// 사용 예시
const audioInput = document.getElementById('audioInput');
const audioFile = audioInput.files[0];
const voiceResult = await analyzeVoiceTone(audioFile);
console.log('음성 분석 결과:', voiceResult);
```

### 4. 멀티모달 통합 분석

```javascript
/**
 * 멀티모달 통합 감정 분석
 * @param {Object} data - 분석할 데이터
 * @returns {Promise<IntegratedEmotionAnalysis>}
 */
async function analyzeMultimodal(data) {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze/multimodal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message);
    }

    return result.data;
  } catch (error) {
    console.error('멀티모달 분석 실패:', error);
    throw error;
  }
}

// 사용 예시
const multimodalData = {
  facial: facialResult,  // 얼굴 분석 결과
  voice: voiceResult,    // 음성 분석 결과
  text: { content: "오늘 정말 기분이 좋아요!" },
  context: "일상 대화",
  sessionId: "session_123"
};

const integratedResult = await analyzeMultimodal(multimodalData);
console.log('통합 분석 결과:', integratedResult);
```

---

## 📊 데이터 구조

### VAD 점수 (Valence-Arousal-Dominance)
```typescript
interface VADScore {
  valence: number;    // 감정의 긍정성 (0-1)
  arousal: number;    // 감정의 활성화 정도 (0-1)
  dominance: number;  // 감정의 지배성 (0-1)
}
```

### 텍스트 분석 결과
```typescript
interface TextAnalysisResult {
  vadScore: VADScore;
  confidence: number;           // 신뢰도 (0-1)
  primaryEmotion: string;       // 주요 감정
  keywords: string[];           // 감지된 키워드
  intensity: 'low' | 'medium' | 'high';  // 감정 강도
  textLength: number;           // 텍스트 길이
}
```

### 멀티모달 통합 분석 결과
```typescript
interface IntegratedEmotionAnalysis {
  overallVAD: VADScore;         // 통합 VAD 점수
  confidence: number;           // 전체 신뢰도
  primaryEmotion: string;       // 주요 감정
  secondaryEmotions: string[];  // 보조 감정들
  analysis: {                   // 개별 분석 결과
    facial?: FacialAnalysisResult;
    voice?: VoiceAnalysisResult;
    text?: TextAnalysisResult;
  };
  recommendations: string[];    // 권장사항
  riskLevel: 'low' | 'medium' | 'high';  // 위험 수준
}
```

---

## 💡 실제 사용 예시

### React 컴포넌트 예시

```jsx
import React, { useState, useRef } from 'react';

const EmotionAnalysisComponent = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const textInputRef = useRef();
  const imageInputRef = useRef();
  const audioInputRef = useRef();

  // 텍스트 분석
  const handleTextAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const text = textInputRef.current.value;
      if (!text.trim()) {
        throw new Error('텍스트를 입력해주세요.');
      }

      const result = await analyzeTextEmotion(text);
      setAnalysisResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 얼굴 분석
  const handleFacialAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const imageFile = imageInputRef.current.files[0];
      if (!imageFile) {
        throw new Error('이미지를 선택해주세요.');
      }

      const result = await analyzeFacialExpression(imageFile);
      setAnalysisResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 멀티모달 분석
  const handleMultimodalAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const text = textInputRef.current.value;
      const imageFile = imageInputRef.current.files[0];
      const audioFile = audioInputRef.current.files[0];

      // 개별 분석 수행
      const textResult = text ? await analyzeTextEmotion(text) : null;
      const facialResult = imageFile ? await analyzeFacialExpression(imageFile) : null;
      const voiceResult = audioFile ? await analyzeVoiceTone(audioFile) : null;

      // 통합 분석
      const multimodalData = {
        text: textResult ? { content: text } : undefined,
        facial: facialResult,
        voice: voiceResult,
        context: "사용자 감정 분석",
        sessionId: `session_${Date.now()}`
      };

      const result = await analyzeMultimodal(multimodalData);
      setAnalysisResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 결과 렌더링
  const renderAnalysisResult = () => {
    if (!analysisResult) return null;

    return (
      <div className="analysis-result">
        <h3>감정 분석 결과</h3>
        
        {/* VAD 점수 */}
        <div className="vad-scores">
          <h4>VAD 점수</h4>
          <div className="vad-item">
            <span>긍정성 (Valence):</span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${analysisResult.vadScore?.valence * 100}%` }}
              />
            </div>
            <span>{Math.round(analysisResult.vadScore?.valence * 100)}%</span>
          </div>
          <div className="vad-item">
            <span>활성화 (Arousal):</span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${analysisResult.vadScore?.arousal * 100}%` }}
              />
            </div>
            <span>{Math.round(analysisResult.vadScore?.arousal * 100)}%</span>
          </div>
          <div className="vad-item">
            <span>지배성 (Dominance):</span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${analysisResult.vadScore?.dominance * 100}%` }}
              />
            </div>
            <span>{Math.round(analysisResult.vadScore?.dominance * 100)}%</span>
          </div>
        </div>

        {/* 주요 감정 */}
        <div className="primary-emotion">
          <h4>주요 감정</h4>
          <div className="emotion-badge">
            {analysisResult.primaryEmotion}
          </div>
        </div>

        {/* 보조 감정 */}
        {analysisResult.secondaryEmotions && (
          <div className="secondary-emotions">
            <h4>보조 감정</h4>
            <div className="emotion-tags">
              {analysisResult.secondaryEmotions.map((emotion, index) => (
                <span key={index} className="emotion-tag">{emotion}</span>
              ))}
            </div>
          </div>
        )}

        {/* 신뢰도 */}
        <div className="confidence">
          <h4>신뢰도</h4>
          <div className="confidence-bar">
            <div 
              className="confidence-fill" 
              style={{ width: `${analysisResult.confidence * 100}%` }}
            />
          </div>
          <span>{Math.round(analysisResult.confidence * 100)}%</span>
        </div>

        {/* 위험 수준 */}
        {analysisResult.riskLevel && (
          <div className="risk-level">
            <h4>위험 수준</h4>
            <div className={`risk-badge risk-${analysisResult.riskLevel}`}>
              {analysisResult.riskLevel}
            </div>
          </div>
        )}

        {/* 권장사항 */}
        {analysisResult.recommendations && (
          <div className="recommendations">
            <h4>권장사항</h4>
            <ul>
              {analysisResult.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="emotion-analysis">
      <h2>감정 분석</h2>
      
      {/* 입력 폼 */}
      <div className="input-section">
        <div className="input-group">
          <label>텍스트 입력:</label>
          <textarea 
            ref={textInputRef}
            placeholder="감정을 분석할 텍스트를 입력하세요..."
            rows={3}
          />
        </div>
        
        <div className="input-group">
          <label>이미지 업로드:</label>
          <input 
            type="file" 
            ref={imageInputRef}
            accept="image/*"
          />
        </div>
        
        <div className="input-group">
          <label>오디오 업로드:</label>
          <input 
            type="file" 
            ref={audioInputRef}
            accept="audio/*"
          />
        </div>
      </div>

      {/* 분석 버튼 */}
      <div className="button-group">
        <button 
          onClick={handleTextAnalysis}
          disabled={loading}
        >
          텍스트 분석
        </button>
        <button 
          onClick={handleFacialAnalysis}
          disabled={loading}
        >
          얼굴 분석
        </button>
        <button 
          onClick={handleMultimodalAnalysis}
          disabled={loading}
        >
          통합 분석
        </button>
      </div>

      {/* 로딩 상태 */}
      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>감정 분석 중...</p>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="error">
          <p>❌ {error}</p>
        </div>
      )}

      {/* 분석 결과 */}
      {renderAnalysisResult()}
    </div>
  );
};

export default EmotionAnalysisComponent;
```

### CSS 스타일링 예시

```css
.emotion-analysis {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.input-section {
  margin-bottom: 20px;
}

.input-group {
  margin-bottom: 15px;
}

.input-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.input-group textarea,
.input-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.button-group button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
}

.button-group button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 20px;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  background-color: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.analysis-result {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.vad-scores {
  margin-bottom: 20px;
}

.vad-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  gap: 10px;
}

.progress-bar {
  flex: 1;
  height: 20px;
  background-color: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #007bff;
  transition: width 0.3s ease;
}

.emotion-badge {
  display: inline-block;
  padding: 5px 15px;
  background-color: #28a745;
  color: white;
  border-radius: 20px;
  font-weight: bold;
}

.emotion-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.emotion-tag {
  padding: 3px 10px;
  background-color: #6c757d;
  color: white;
  border-radius: 15px;
  font-size: 12px;
}

.confidence-bar {
  width: 100%;
  height: 20px;
  background-color: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 10px;
}

.confidence-fill {
  height: 100%;
  background-color: #28a745;
  transition: width 0.3s ease;
}

.risk-badge {
  display: inline-block;
  padding: 5px 15px;
  border-radius: 20px;
  font-weight: bold;
  color: white;
}

.risk-low {
  background-color: #28a745;
}

.risk-medium {
  background-color: #ffc107;
  color: #212529;
}

.risk-high {
  background-color: #dc3545;
}

.recommendations ul {
  list-style-type: none;
  padding: 0;
}

.recommendations li {
  padding: 5px 0;
  border-bottom: 1px solid #dee2e6;
}

.recommendations li:last-child {
  border-bottom: none;
}
```

---

## ⚠️ 에러 처리

### 일반적인 에러 상황

```javascript
// 네트워크 에러
try {
  const result = await analyzeTextEmotion(text);
} catch (error) {
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    console.error('네트워크 연결을 확인해주세요.');
  } else {
    console.error('감정 분석 중 오류가 발생했습니다:', error.message);
  }
}

// 파일 크기 제한
const MAX_FILE_SIZE = {
  image: 5 * 1024 * 1024,  // 5MB
  audio: 10 * 1024 * 1024  // 10MB
};

function validateFileSize(file, type) {
  if (file.size > MAX_FILE_SIZE[type]) {
    throw new Error(`${type === 'image' ? '이미지' : '오디오'} 파일이 너무 큽니다.`);
  }
}

// 파일 형식 검증
function validateFileType(file, allowedTypes) {
  if (!allowedTypes.includes(file.type)) {
    throw new Error('지원하지 않는 파일 형식입니다.');
  }
}
```

---

## 🚀 성능 최적화

### 1. 요청 캐싱

```javascript
class EmotionAnalysisCache {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5분
  }

  async getCachedResult(key, analysisFunction) {
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.result;
    }

    const result = await analysisFunction();
    this.cache.set(key, {
      result,
      timestamp: Date.now()
    });

    return result;
  }

  clearCache() {
    this.cache.clear();
  }
}

// 사용 예시
const cache = new EmotionAnalysisCache();
const textHash = btoa(text); // 간단한 해시

const result = await cache.getCachedResult(
  `text_${textHash}`,
  () => analyzeTextEmotion(text)
);
```

### 2. 디바운싱

```javascript
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 실시간 텍스트 분석
const debouncedTextAnalysis = debounce(async (text) => {
  if (text.trim().length > 10) { // 최소 10자 이상
    const result = await analyzeTextEmotion(text);
    updateEmotionDisplay(result);
  }
}, 500);
```

### 3. 로딩 상태 관리

```javascript
const useEmotionAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const analyze = async (analysisFunction) => {
    try {
      setLoading(true);
      setError(null);
      const data = await analysisFunction();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, result, analyze };
};
```

---

## 📱 모바일 최적화

### 터치 이벤트 처리

```javascript
// 모바일에서 파일 선택 최적화
const handleFileSelect = (event, type) => {
  const file = event.target.files[0];
  
  if (file) {
    // 파일 크기 및 형식 검증
    validateFileSize(file, type);
    validateFileType(file, getAllowedTypes(type));
    
    // 모바일에서 즉시 분석 시작
    if (type === 'image') {
      handleFacialAnalysis(file);
    } else if (type === 'audio') {
      handleVoiceAnalysis(file);
    }
  }
};

// 모바일 카메라/마이크 접근
const requestMediaAccess = async (type) => {
  try {
    if (type === 'camera') {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // 카메라 스트림 처리
    } else if (type === 'microphone') {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // 마이크 스트림 처리
    }
  } catch (error) {
    console.error('미디어 접근 권한이 필요합니다:', error);
  }
};
```

---

## 🔧 개발 도구

### API 테스트 도구

```javascript
// API 테스트 함수
const testEmotionAPI = async () => {
  const testCases = [
    { text: "오늘 정말 기분이 좋아요!", expected: "happy" },
    { text: "너무 슬퍼요...", expected: "sad" },
    { text: "정말 화가 나요!", expected: "angry" },
    { text: "와! 놀라워요!", expected: "surprised" }
  ];

  for (const testCase of testCases) {
    try {
      const result = await analyzeTextEmotion(testCase.text);
      console.log(`테스트: "${testCase.text}"`);
      console.log(`예상: ${testCase.expected}, 실제: ${result.primaryEmotion}`);
      console.log(`VAD:`, result.vadScore);
      console.log('---');
    } catch (error) {
      console.error(`테스트 실패: ${testCase.text}`, error);
    }
  }
};
```

이 가이드를 통해 프론트엔드에서 BeMore 감정 분석 API를 효과적으로 통합하고 사용할 수 있습니다! 🎉 