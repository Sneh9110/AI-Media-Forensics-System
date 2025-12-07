# AI Forensics System - Testing Guide

## System Status ✅
- **Enhanced AI Detector**: Active and configured
- **Airia AI Forensic Agent**: Integrated with real API credentials
- **Server**: Running on http://localhost:3000
- **Agent ID**: 9757f528-c80f-452e-b020-2699238cbcb4 (Fraud Detection Orchestrator)

## Testing the Complete Pipeline

### 1. Upload Test Images
Visit: http://localhost:3000/upload

**Recommended test images:**
- AI-generated images (from DALL-E, Midjourney, etc.)
- Real photographs from cameras/phones
- Manipulated/edited images

### 2. Analysis Flow
The system now runs **two-layer analysis**:

1. **Primary**: Enhanced PyTorch detector with:
   - Frequency domain analysis (FFT/DCT)
   - Temperature scaling for confidence calibration
   - Uncertainty handling (returns "UNCERTAIN" for low confidence)
   - Grad-CAM visualization
   - No more false positives at 95% confidence

2. **Secondary**: Airia AI Forensic Agent verification:
   - Uses your exported "Fraud Detection Orchestrator" agent
   - Provides additional forensic analysis
   - Real-time API integration with production credentials

### 3. Expected Results
- **AI Images**: Should no longer be misclassified as authentic
- **Real Images**: Should be correctly identified as authentic
- **Low Confidence**: Returns "UNCERTAIN" instead of false confidence
- **Heatmaps**: Visual attention maps showing detection focus areas
- **Forensic Report**: Additional verification from Airia agent

### 4. Verification Steps

#### Check Enhanced Detection Working:
1. Upload an AI-generated image
2. Verify it's NOT classified as "Authentic" with 95% confidence
3. Look for frequency analysis features in results
4. Check for Grad-CAM heatmap

#### Check Airia Integration Working:
1. Look for "Forensic Agent Analysis" section in results
2. Verify Airia agent provides additional insights
3. Check console logs for successful agent communication

#### Check Uncertainty Handling:
1. Upload ambiguous/low-quality images
2. Verify system returns "UNCERTAIN" for unclear cases
3. Check that confidence values are properly calibrated

### 5. Console Monitoring
Watch browser console and terminal for:
```
[Enhanced AI Detector] Analysis complete
[Airia AI] Initialized with Fraud Detection Orchestrator agent
[Airia AI] Executing forensic analysis with agent
[Airia AI] Response status: 200
```

### 6. API Endpoints
- **Analysis**: POST `/api/analyze`
- **Status**: GET `/api/status/[id]`
- **Results**: GET `/api/analyses/[id]`

### 7. Troubleshooting

#### If Enhanced Detector Issues:
- Check Python environment setup
- Verify PyTorch installation
- Review prediction logs in `/api/analyze`

#### If Airia Agent Issues:
- Check API credentials are correctly configured
- Verify network connectivity to Airia servers
- Review agent execution logs

#### If False Positives Return:
- Check temperature scaling is active (factor 2.0)
- Verify uncertainty threshold (0.75) is applied
- Review frequency domain features extraction

## Production Ready ✅
The system is now configured with:
- Real Airia API credentials
- Enhanced detection pipeline
- Proper error handling
- Comprehensive logging
- Fallback mechanisms

Test thoroughly and enjoy your upgraded AI detection system!