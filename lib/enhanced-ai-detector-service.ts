/*
Enhanced AI Detector Integration for Node.js API
==============================================

TypeScript integration layer to connect the enhanced PyTorch model
with the existing Node.js API infrastructure.
*/

import { spawn, ChildProcess } from 'child_process'
import { join } from 'path'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { tmpdir } from 'os'
import { randomUUID } from 'crypto'

interface EnhancedAnalysisResult {
  prediction: 'real' | 'synthetic'
  confidence: number
  isAIGenerated: boolean
  heatmapData: string | null
  analysis: {
    spatialScore: number
    frequencyScore: number
    metadataScore: number
    aiGenerationScore: number
    deepfakeScore: number
    manipulationScore: number
    prnuSensorScore: number
    enhancedAnalysis: {
      isCertain: boolean
      thresholdUsed: number
      modelVersion: string
    }
  }
  artifacts: Array<{
    type: string
    severity: number
    location: { x: number; y: number; width: number; height: number }
    description: string
  }>
}

interface ModelConfig {
  modelPath?: string
  confidenceThreshold: number
  deviceType: 'auto' | 'cpu' | 'cuda'
  enableIncremental: boolean
  maxReplayBufferSize: number
}

class EnhancedAIDetectorService {
  private pythonProcess: ChildProcess | null = null
  private isInitialized = false
  private config: ModelConfig
  private tempDir: string

  constructor(config: Partial<ModelConfig> = {}) {
    this.config = {
      modelPath: config.modelPath,
      confidenceThreshold: config.confidenceThreshold || 0.8,
      deviceType: config.deviceType || 'auto',
      enableIncremental: config.enableIncremental || true,
      maxReplayBufferSize: config.maxReplayBufferSize || 10000
    }
    
    this.tempDir = join(tmpdir(), 'ai-forensics-enhanced')
    
    // Ensure temp directory exists
    if (!existsSync(this.tempDir)) {
      require('fs').mkdirSync(this.tempDir, { recursive: true })
    }
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return
    }

    console.log('[Enhanced AI Detector] Initializing PyTorch model...')
    
    try {
      // Create Python script for model inference
      const pythonScript = this.createPythonInterface()
      const scriptPath = join(this.tempDir, 'enhanced_detector_interface.py')
      writeFileSync(scriptPath, pythonScript)

      // Start Python process
      this.pythonProcess = spawn('python', [scriptPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, PYTHONPATH: join(__dirname, '..') }
      })

      // Wait for initialization
      await this.waitForInitialization()
      
      this.isInitialized = true
      console.log('[Enhanced AI Detector] Successfully initialized')
    } catch (error) {
      console.error('[Enhanced AI Detector] Initialization failed:', error)
      throw error
    }
  }

  async analyzeImage(imageBuffer: ArrayBuffer, metadata: any): Promise<EnhancedAnalysisResult> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      // Convert ArrayBuffer to base64 for Python processing
      const buffer = Buffer.from(imageBuffer)
      const base64Image = buffer.toString('base64')
      
      // Prepare analysis request
      const request = {
        type: 'analyze',
        data: {
          image: base64Image,
          metadata: metadata,
          return_heatmap: true
        }
      }

      // Send request to Python process
      const result = await this.sendRequest(request)
      
      // Convert Python result to TypeScript format
      return this.convertPythonResult(result)
    } catch (error) {
      console.error('[Enhanced AI Detector] Analysis failed:', error)
      throw error
    }
  }

  async addFeedback(imageBuffer: ArrayBuffer, groundTruth: number, userFeedback?: number): Promise<void> {
    if (!this.isInitialized) {
      return
    }

    try {
      const buffer = Buffer.from(imageBuffer)
      const base64Image = buffer.toString('base64')
      
      const request = {
        type: 'feedback',
        data: {
          image: base64Image,
          ground_truth: groundTruth,
          user_feedback: userFeedback
        }
      }

      await this.sendRequest(request)
      console.log('[Enhanced AI Detector] Feedback added successfully')
    } catch (error) {
      console.error('[Enhanced AI Detector] Failed to add feedback:', error)
    }
  }

  async triggerIncrementalTraining(): Promise<void> {
    if (!this.isInitialized || !this.config.enableIncremental) {
      return
    }

    try {
      const request = {
        type: 'train',
        data: {
          num_epochs: 5,
          batch_size: 16
        }
      }

      await this.sendRequest(request)
      console.log('[Enhanced AI Detector] Incremental training completed')
    } catch (error) {
      console.error('[Enhanced AI Detector] Incremental training failed:', error)
    }
  }

  async saveModel(path: string): Promise<void> {
    if (!this.isInitialized) {
      return
    }

    try {
      const request = {
        type: 'save',
        data: { path }
      }

      await this.sendRequest(request)
      console.log(`[Enhanced AI Detector] Model saved to ${path}`)
    } catch (error) {
      console.error('[Enhanced AI Detector] Failed to save model:', error)
    }
  }

  private createPythonInterface(): string {
    return `
import sys
import json
import base64
import numpy as np
import cv2
from io import BytesIO
import traceback
sys.path.append('${join(__dirname, '..')}')

from enhanced_ai_detector import create_enhanced_detector, analyze_image_enhanced

class EnhancedDetectorInterface:
    def __init__(self):
        self.detector = None
        self.initialize()
    
    def initialize(self):
        try:
            model_path = ${this.config.modelPath ? `"${this.config.modelPath}"` : 'None'}
            self.detector = create_enhanced_detector(model_path)
            print(json.dumps({'status': 'initialized'}))
            sys.stdout.flush()
        except Exception as e:
            print(json.dumps({'status': 'error', 'message': str(e)}))
            sys.stdout.flush()
    
    def process_request(self, request):
        try:
            req_type = request.get('type')
            data = request.get('data', {})
            
            if req_type == 'analyze':
                return self.analyze(data)
            elif req_type == 'feedback':
                return self.add_feedback(data)
            elif req_type == 'train':
                return self.train(data)
            elif req_type == 'save':
                return self.save_model(data)
            else:
                return {'error': f'Unknown request type: {req_type}'}
        
        except Exception as e:
            return {'error': str(e), 'traceback': traceback.format_exc()}
    
    def analyze(self, data):
        # Decode base64 image
        image_data = base64.b64decode(data['image'])
        nparr = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Analyze with enhanced detector
        result = analyze_image_enhanced(image, self.detector)
        
        # Convert heatmap to base64 if present
        if result.get('heatmap') is not None:
            heatmap = result['heatmap']
            if isinstance(heatmap, np.ndarray):
                # Convert numpy array to base64 image
                heatmap_normalized = ((heatmap - heatmap.min()) / (heatmap.max() - heatmap.min()) * 255).astype(np.uint8)
                heatmap_colored = cv2.applyColorMap(heatmap_normalized, cv2.COLORMAP_JET)
                _, buffer = cv2.imencode('.png', heatmap_colored)
                result['heatmap'] = base64.b64encode(buffer).decode('utf-8')
        
        return result
    
    def add_feedback(self, data):
        # Decode image
        image_data = base64.b64decode(data['image'])
        nparr = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Add feedback
        self.detector.add_feedback(
            image, 
            data['ground_truth'], 
            data.get('user_feedback')
        )
        
        return {'status': 'feedback_added'}
    
    def train(self, data):
        self.detector.incremental_train(
            num_epochs=data.get('num_epochs', 5),
            batch_size=data.get('batch_size', 16)
        )
        return {'status': 'training_completed'}
    
    def save_model(self, data):
        self.detector.save_model(data['path'])
        return {'status': 'model_saved'}

# Main loop
interface = EnhancedDetectorInterface()

try:
    while True:
        line = sys.stdin.readline()
        if not line:
            break
        
        try:
            request = json.loads(line.strip())
            response = interface.process_request(request)
            print(json.dumps(response))
            sys.stdout.flush()
        except json.JSONDecodeError:
            print(json.dumps({'error': 'Invalid JSON request'}))
            sys.stdout.flush()
        except Exception as e:
            print(json.dumps({'error': str(e)}))
            sys.stdout.flush()

except KeyboardInterrupt:
    pass
`
  }

  private async waitForInitialization(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Initialization timeout'))
      }, 30000) // 30 second timeout

      const onData = (data: Buffer) => {
        try {
          const response = JSON.parse(data.toString().trim())
          if (response.status === 'initialized') {
            clearTimeout(timeout)
            this.pythonProcess?.stdout?.off('data', onData)
            resolve()
          } else if (response.status === 'error') {
            clearTimeout(timeout)
            this.pythonProcess?.stdout?.off('data', onData)
            reject(new Error(response.message))
          }
        } catch (e) {
          // Ignore parsing errors during initialization
        }
      }

      this.pythonProcess?.stdout?.on('data', onData)
    })
  }

  private async sendRequest(request: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.pythonProcess || !this.pythonProcess.stdin) {
        reject(new Error('Python process not available'))
        return
      }

      const requestId = randomUUID()
      const requestWithId = { ...request, id: requestId }

      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'))
      }, 60000) // 60 second timeout

      const onData = (data: Buffer) => {
        try {
          const lines = data.toString().split('\n').filter(line => line.trim())
          
          for (const line of lines) {
            const response = JSON.parse(line)
            if (response.error) {
              clearTimeout(timeout)
              this.pythonProcess?.stdout?.off('data', onData)
              reject(new Error(response.error))
              return
            } else {
              clearTimeout(timeout)
              this.pythonProcess?.stdout?.off('data', onData)
              resolve(response)
              return
            }
          }
        } catch (e) {
          // Continue listening for valid JSON
        }
      }

      this.pythonProcess.stdout?.on('data', onData)
      this.pythonProcess.stdin.write(JSON.stringify(requestWithId) + '\n')
    })
  }

  private convertPythonResult(pythonResult: any): EnhancedAnalysisResult {
    return {
      prediction: pythonResult.prediction,
      confidence: pythonResult.confidence,
      isAIGenerated: pythonResult.prediction === 'synthetic',
      heatmapData: pythonResult.heatmap ? `data:image/png;base64,${pythonResult.heatmap}` : null,
      analysis: {
        spatialScore: pythonResult.metadata?.spatialScore || 0.5,
        frequencyScore: pythonResult.metadata?.frequencyScore || 0.5,
        metadataScore: pythonResult.metadata?.metadataScore || 0.5,
        aiGenerationScore: pythonResult.metadata?.aiGenerationScore || 0.5,
        deepfakeScore: pythonResult.metadata?.deepfakeScore || 0.5,
        manipulationScore: pythonResult.metadata?.manipulationScore || 0.5,
        prnuSensorScore: pythonResult.metadata?.prnuSensorScore || 0.5,
        enhancedAnalysis: {
          isCertain: pythonResult.metadata?.enhancedAnalysis?.is_certain || false,
          thresholdUsed: pythonResult.metadata?.enhancedAnalysis?.threshold_used || 0.8,
          modelVersion: pythonResult.metadata?.enhancedAnalysis?.model_version || '3.0.0-enhanced'
        }
      },
      artifacts: this.extractArtifacts(pythonResult)
    }
  }

  private extractArtifacts(pythonResult: any): Array<any> {
    // Convert heatmap data to artifact locations
    const artifacts = []
    
    if (pythonResult.metadata?.enhancedAnalysis && !pythonResult.metadata.enhancedAnalysis.is_certain) {
      artifacts.push({
        type: 'low_confidence',
        severity: 1 - pythonResult.confidence,
        location: { x: 0, y: 0, width: 100, height: 100 },
        description: `Low confidence detection (${(pythonResult.confidence * 100).toFixed(1)}%)`
      })
    }

    if (pythonResult.metadata?.aiGenerationScore > 0.7) {
      artifacts.push({
        type: 'ai_generation_patterns',
        severity: pythonResult.metadata.aiGenerationScore,
        location: { x: 10, y: 10, width: 80, height: 80 },
        description: 'High probability AI generation patterns detected'
      })
    }

    return artifacts
  }

  async shutdown(): Promise<void> {
    if (this.pythonProcess) {
      this.pythonProcess.kill()
      this.pythonProcess = null
    }
    this.isInitialized = false
  }
}

// Export for use in existing API
export { EnhancedAIDetectorService }
export type { EnhancedAnalysisResult, ModelConfig }

// Create singleton instance for API use
export const enhancedDetector = new EnhancedAIDetectorService({
  confidenceThreshold: 0.8,
  deviceType: 'auto',
  enableIncremental: true,
  maxReplayBufferSize: 10000
})