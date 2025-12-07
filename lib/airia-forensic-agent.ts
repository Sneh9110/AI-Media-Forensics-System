/**
 * Airia AI Agent Integration for Enhanced Forensics
 * Connects the exported Airia agent with our enhanced AI detection system
 */

import { airiaAI } from '@/lib/airia-ai';

export interface AiriaForensicAnalysis {
  agent_prediction: 'real' | 'synthetic' | 'uncertain';
  confidence_assessment: number;
  forensic_reasoning: string;
  fingerprint_analysis: {
    gan_signatures: string[];
    diffusion_artifacts: string[];
    metadata_anomalies: string[];
  };
  recommendations: {
    human_review_needed: boolean;
    retraining_suggested: boolean;
    confidence_level: 'high' | 'medium' | 'low';
  };
}

export class AiriaForensicAgent {
  private agentId = "9757f528-c80f-452e-b020-2699238cbcb4";
  private agentName = "Fraud Detection Orchestrator";

  /**
   * Analyze detection results using the Airia forensic agent
   */
  async analyzeDetectionResults(detectionData: {
    model_prediction: string;
    p_real: number;
    p_fake: number;
    confidence: number;
    frequency_stats: any;
    metadata_anomalies: any;
    ela_results: any;
    heatmap_regions: any;
  }): Promise<AiriaForensicAnalysis> {
    
    try {
      // Prepare forensic analysis prompt
      const forensicPrompt = this.buildForensicPrompt(detectionData);
      
      // Call Airia AI service with agent configuration
      const response = await airiaAI.analyzeWithForensicAgent({
        detection_data: detectionData,
        agent_prompt: forensicPrompt,
        agent_id: this.agentId
      });

      return this.parseForensicResponse(response);

    } catch (error) {
      console.error('[Airia Forensic Agent] Analysis failed:', error);
      
      return {
        agent_prediction: 'uncertain',
        confidence_assessment: 0.0,
        forensic_reasoning: 'Agent analysis failed - falling back to model prediction',
        fingerprint_analysis: {
          gan_signatures: [],
          diffusion_artifacts: [],
          metadata_anomalies: []
        },
        recommendations: {
          human_review_needed: true,
          retraining_suggested: false,
          confidence_level: 'low'
        }
      };
    }
  }

  /**
   * Build forensic analysis prompt for the agent
   */
  private buildForensicPrompt(data: any): string {
    return `
FORENSIC ANALYSIS REQUEST

Model Prediction: ${data.model_prediction}
Probability Real: ${data.p_real.toFixed(3)}
Probability Fake: ${data.p_fake.toFixed(3)}
Model Confidence: ${data.confidence.toFixed(3)}

EXTRACTED FEATURES:
- Frequency Statistics: ${JSON.stringify(data.frequency_stats, null, 2)}
- Metadata Anomalies: ${JSON.stringify(data.metadata_anomalies, null, 2)}
- ELA Results: ${JSON.stringify(data.ela_results, null, 2)}
- Heatmap Regions: ${JSON.stringify(data.heatmap_regions, null, 2)}

FORENSIC VERIFICATION TASKS:
1. Verify if the model's prediction (${data.model_prediction}) is reasonable given the extracted features
2. Cross-check against known GAN and diffusion fingerprints in your knowledge base
3. Assess if confidence level (${data.confidence.toFixed(3)}) is appropriate
4. Determine if human review or model retraining is needed

Please provide:
- Your forensic assessment (real/synthetic/uncertain)
- Confidence in your assessment (0.0-1.0)
- Detailed reasoning based on the features
- Any GAN/diffusion signatures detected
- Recommendations for next steps
`;
  }

  /**
   * Parse response from Airia agent
   */
  private parseForensicResponse(response: any): AiriaForensicAnalysis {
    // Extract structured data from agent response
    const text = response.analysis || response.result || '';
    
    // Parse agent prediction
    let agent_prediction: 'real' | 'synthetic' | 'uncertain' = 'uncertain';
    if (text.toLowerCase().includes('real') && !text.toLowerCase().includes('synthetic')) {
      agent_prediction = 'real';
    } else if (text.toLowerCase().includes('synthetic') || text.toLowerCase().includes('fake')) {
      agent_prediction = 'synthetic';
    }

    // Extract confidence (look for patterns like "confidence: 0.85" or "85% confident")
    let confidence_assessment = 0.5;
    const confMatch = text.match(/confidence[:\s]+([0-9.]+)/i) || text.match(/([0-9.]+)%?\s*confident/i);
    if (confMatch) {
      confidence_assessment = parseFloat(confMatch[1]);
      if (confidence_assessment > 1) confidence_assessment /= 100; // Convert percentage
    }

    // Extract signatures and artifacts
    const gan_signatures = this.extractPatterns(text, ['gan', 'generator', 'discriminator']);
    const diffusion_artifacts = this.extractPatterns(text, ['diffusion', 'noise', 'denoising']);
    const metadata_anomalies = this.extractPatterns(text, ['metadata', 'exif', 'timestamp']);

    // Determine recommendations
    const human_review_needed = confidence_assessment < 0.8 || text.toLowerCase().includes('human review');
    const retraining_suggested = text.toLowerCase().includes('retrain') || text.toLowerCase().includes('re-train');
    const confidence_level = confidence_assessment > 0.8 ? 'high' : confidence_assessment > 0.6 ? 'medium' : 'low';

    return {
      agent_prediction,
      confidence_assessment,
      forensic_reasoning: text,
      fingerprint_analysis: {
        gan_signatures,
        diffusion_artifacts,
        metadata_anomalies
      },
      recommendations: {
        human_review_needed,
        retraining_suggested,
        confidence_level
      }
    };
  }

  /**
   * Extract patterns from text based on keywords
   */
  private extractPatterns(text: string, keywords: string[]): string[] {
    const patterns = [];
    const sentences = text.split(/[.!?]/);
    
    for (const sentence of sentences) {
      for (const keyword of keywords) {
        if (sentence.toLowerCase().includes(keyword)) {
          patterns.push(sentence.trim());
          break;
        }
      }
    }
    
    return patterns;
  }
}

// Export singleton instance
export const airiaForensicAgent = new AiriaForensicAgent();