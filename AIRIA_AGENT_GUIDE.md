# 🤖 **Airia AI Agent Integration Guide**

## **What You Have:**
You've exported a sophisticated **"Fraud Detection Orchestrator"** agent from Airia AI that's specifically designed for forensic analysis of AI-generated media. This agent can serve as an intelligent co-pilot for your enhanced AI detection system.

## **🎯 What This Agent Does:**

Your exported agent is configured to:

### **Core Functions:**
- ✅ **Verify Model Predictions**: Cross-checks if your enhanced detector's predictions are reasonable
- ✅ **Knowledge Base Analysis**: Uses Airia's knowledge graph of known GAN and diffusion fingerprints
- ✅ **Confidence Assessment**: Evaluates if prediction confidence levels are appropriate
- ✅ **Quality Control**: Flags cases needing human review or model retraining
- ✅ **Expert Reasoning**: Provides forensic-level analysis and explanations

### **Input Analysis:**
- Model prediction probabilities (p_real, p_fake)
- Model confidence scores
- Extracted features (metadata anomalies, frequency stats, ELA results)
- Heatmap regions of interest

### **Output Recommendations:**
- Verification of model predictions
- Suggestions for human review when confidence < 0.8
- Retraining recommendations
- Detailed forensic reasoning

## **🔗 Integration Options:**

### **1. ✅ ALREADY INTEGRATED: Enhanced Pipeline**

I've already integrated your agent into the enhanced detection system:

```typescript
// Your agent is now part of the analysis pipeline
const forensicAnalysis = await airiaForensicAgent.analyzeDetectionResults({
  model_prediction: enhancedResult.prediction,
  p_real: enhancedResult.real_probability,
  p_fake: enhancedResult.synthetic_probability,
  confidence: enhancedResult.confidence,
  // ... other forensic data
});
```

**How it works now:**
1. 🔍 Enhanced PyTorch detector analyzes image
2. 🤖 Airia forensic agent verifies the results
3. 📊 Combined analysis provides final verdict
4. 🎯 Agent flags uncertain cases for human review

### **2. 🌐 Deploy as Standalone API**

You can also deploy your agent independently:

#### **Option A: Airia Platform Deployment**
1. Import your JSON into Airia AI platform
2. Deploy as API endpoint
3. Configure webhook integration with your system

#### **Option B: Custom Integration**
```bash
# Use Airia CLI to deploy
airia-cli agent deploy --config fraud-detection-orchestrator.json
```

### **3. 📱 Web Interface Integration**

Add forensic agent insights to your dashboard:

```typescript
// Display agent analysis in UI
const AgentInsights = ({ forensicAnalysis }) => (
  <div className="forensic-insights">
    <h3>🕵️ Forensic Agent Analysis</h3>
    <div className="agent-verdict">
      <span>Agent Assessment: {forensicAnalysis.agent_prediction}</span>
      <span>Confidence: {forensicAnalysis.confidence_assessment}</span>
    </div>
    <div className="forensic-reasoning">
      {forensicAnalysis.forensic_reasoning}
    </div>
    {forensicAnalysis.recommendations.human_review_needed && (
      <Alert type="warning">
        🚨 Human review recommended
      </Alert>
    )}
  </div>
);
```

## **🚀 Recommended Next Steps:**

### **1. Test Current Integration**

Your agent is already working! Test it:

```bash
# Start your server
npm start

# Upload an image at http://localhost:3000/upload
# Check analysis results for forensic agent insights
```

### **2. Configure Agent Settings**

Edit the agent configuration in `lib/airia-forensic-agent.ts`:

```typescript
// Adjust thresholds
const confidence_threshold = 0.8;  // When to flag for human review
const uncertainty_threshold = 0.75; // When to mark as uncertain
```

### **3. Monitor Agent Performance**

Add logging to track agent accuracy:

```typescript
// Log agent vs model agreement
console.log(`Model: ${modelPrediction}, Agent: ${agentPrediction}`);
```

### **4. Expand Agent Capabilities**

Your exported agent includes these tools you can leverage:
- **LinkPreview**: Analyze source URLs of images
- **DALL-E Integration**: Generate test images for validation
- **DocGen**: Create forensic reports automatically

## **💡 Advanced Use Cases:**

### **Quality Assurance Pipeline**
```
Image Upload → Enhanced Detector → Forensic Agent → Human Review (if flagged)
```

### **Continuous Learning**
```
Agent Feedback → Model Retraining → Improved Accuracy
```

### **Forensic Reporting**
```
Agent Analysis → Automated Report Generation → Legal Documentation
```

## **🎯 Agent Configuration Details:**

From your export, the agent is configured with:

- **Agent ID**: `9757f528-c80f-452e-b020-2699238cbcb4`
- **Model**: Gemini 2.5 Pro (multimodal capabilities)
- **Tools**: LinkPreview, DALL-E, DocGen
- **Workflow**: Input → Data Source → AI Model → Output

## **🔧 Immediate Actions:**

1. **✅ DONE**: Agent integrated into your enhanced detection system
2. **🧪 TEST**: Upload images to verify agent analysis
3. **📊 MONITOR**: Check forensic insights in analysis results
4. **⚙️ TUNE**: Adjust confidence thresholds if needed
5. **📈 SCALE**: Deploy to production when satisfied

## **🎉 Benefits You Get:**

- **Dual Validation**: Model + Agent verification
- **Expert Knowledge**: Access to Airia's forensic database
- **Intelligent Flagging**: Automatic human review recommendations
- **Detailed Reasoning**: Explainable AI decisions
- **Continuous Improvement**: Agent learns from feedback

Your Airia AI agent is now an integral part of your enhanced AI detection system, providing expert-level forensic analysis and quality assurance! 🚀