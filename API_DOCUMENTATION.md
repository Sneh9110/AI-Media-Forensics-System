/**
 * API Documentation Index
 * Complete reference for all forensic analysis APIs
 */

# API Documentation

## Overview

The Forensic Analysis API provides comprehensive endpoints for analyzing images for synthetic content detection, generating professional forensic reports, and accessing threat intelligence.

### Base URL

```
Production: https://api.forensic-analysis.com/v1
Development: http://localhost:3000/api
```

### Authentication

All requests require Bearer token:

```
Authorization: Bearer {API_KEY}
```

## Analysis Endpoints

### POST /analyses

Create and run forensic analysis on an image.

**Request:**

```bash
curl -X POST https://api.forensic-analysis.com/v1/analyses \
  -H "Authorization: Bearer sk_prod_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/image.jpg",
    "priority": "high",
    "callback": "https://yourserver.com/webhook"
  }'
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| imageUrl | string | Yes | URL or file path to image |
| priority | string | No | low/medium/high (default: medium) |
| callback | string | No | Webhook URL for async notification |
| metadata | object | No | Custom metadata to attach |

**Response (201 Created):**

```json
{
  "success": true,
  "analysisId": "ANALYSIS_20250112_001",
  "result": {
    "decision": "synthetic",
    "confidence": 0.927,
    "timestamp": "2025-01-12T10:30:00Z",
    "processingTime": 474
  },
  "report": {
    "analysisId": "ANALYSIS_20250112_001",
    "decision": "synthetic",
    "confidence": 0.927,
    "features": [...],
    "threats": [...]
  }
}
```

**Error Response (400 Bad Request):**

```json
{
  "success": false,
  "error": {
    "code": "ERR_INVALID_INPUT",
    "message": "Invalid image URL format"
  }
}
```

### GET /analyses/{analysisId}

Retrieve analysis results.

**Request:**

```bash
curl -X GET https://api.forensic-analysis.com/v1/analyses/ANALYSIS_20250112_001 \
  -H "Authorization: Bearer sk_prod_xxxxx"
```

**Response (200 OK):**

```json
{
  "analysisId": "ANALYSIS_20250112_001",
  "status": "completed",
  "result": { ... },
  "report": { ... },
  "createdAt": "2025-01-12T10:30:00Z",
  "completedAt": "2025-01-12T10:30:50Z"
}
```

### GET /analyses

List analyses with pagination.

**Request:**

```bash
curl -X GET "https://api.forensic-analysis.com/v1/analyses?page=1&pageSize=20&decision=synthetic" \
  -H "Authorization: Bearer sk_prod_xxxxx"
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| page | int | Page number (default: 1) |
| pageSize | int | Results per page (default: 20, max: 100) |
| decision | string | Filter by decision (real/synthetic) |
| startDate | ISO string | Filter by start date |
| endDate | ISO string | Filter by end date |
| minConfidence | float | Filter by minimum confidence |

## Report Endpoints

### GET /analyses/{analysisId}/report

Get formatted forensic report.

**Request:**

```bash
curl -X GET "https://api.forensic-analysis.com/v1/analyses/ANALYSIS_20250112_001/report?format=html" \
  -H "Authorization: Bearer sk_prod_xxxxx"
```

**Query Parameters:**

| Parameter | Type | Options |
|-----------|------|---------|
| format | string | text/html/pdf/json |

**Response (text/plain, text/html, application/pdf):**

Returns report in requested format.

### POST /analyses/{analysisId}/report/export

Export report with chain of custody.

**Request:**

```bash
curl -X POST https://api.forensic-analysis.com/v1/analyses/ANALYSIS_20250112_001/report/export \
  -H "Authorization: Bearer sk_prod_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "pdf",
    "includeChainOfCustody": true,
    "signatureRequired": true
  }'
```

## Threat Intelligence Endpoints

### GET /threats

Get threat database summary.

**Request:**

```bash
curl -X GET https://api.forensic-analysis.com/v1/threats \
  -H "Authorization: Bearer sk_prod_xxxxx"
```

**Response:**

```json
{
  "totalThreats": 5,
  "totalDetections": 50490,
  "threats": [
    {
      "id": "SIG_STYLEGAN_001",
      "type": "StyleGAN",
      "accuracy": 0.94,
      "detections": 15420
    },
    {
      "id": "SIG_DIFFUSION_001",
      "type": "Diffusion Models",
      "accuracy": 0.88,
      "detections": 23150
    }
  ],
  "lastUpdated": "2025-01-12T10:00:00Z"
}
```

### GET /threats/{threatId}

Get threat details.

**Request:**

```bash
curl -X GET https://api.forensic-analysis.com/v1/threats/SIG_STYLEGAN_001 \
  -H "Authorization: Bearer sk_prod_xxxxx"
```

**Response:**

```json
{
  "id": "SIG_STYLEGAN_001",
  "type": "StyleGAN",
  "confidence": 0.94,
  "detections": 15420,
  "artifacts": [
    "Concentric circles in DCT",
    "Smooth skin texture",
    "Specific DCT block patterns"
  ],
  "lastDetected": "2025-01-12T09:45:00Z"
}
```

### POST /threats/match

Find threats matching analysis results.

**Request:**

```bash
curl -X POST https://api.forensic-analysis.com/v1/threats/match \
  -H "Authorization: Bearer sk_prod_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "features": [
      {
        "feature": "DCT Compression Artifacts",
        "importance": 0.32,
        "category": "frequency"
      }
    ],
    "decision": "synthetic"
  }'
```

**Response:**

```json
{
  "matches": [
    {
      "threatId": "SIG_STYLEGAN_001",
      "threatType": "StyleGAN",
      "confidence": 0.89,
      "recommendation": "Pattern matches known StyleGAN 2 output"
    }
  ],
  "riskLevel": "high"
}
```

## Health & Status Endpoints

### GET /health

System health status.

**Request:**

```bash
curl https://api.forensic-analysis.com/v1/health
```

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2025-01-12T10:30:00Z",
  "uptime": 864000,
  "models": {
    "airia": { "available": true, "responseTime": 125 },
    "pytorch": { "available": true, "responseTime": 198 },
    "prnu": { "available": true, "responseTime": 151 }
  }
}
```

### GET /status

Detailed status information.

**Response:**

```json
{
  "apiVersion": "1.0.0",
  "systemVersion": "5.0.0",
  "cpuUsage": 35,
  "memoryUsage": 42,
  "activeAnalyses": 12,
  "queuedAnalyses": 3,
  "errorRate": 0.002
}
```

## Error Handling

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| ERR_INVALID_INPUT | 400 | Invalid request parameters |
| ERR_NOT_FOUND | 404 | Resource not found |
| ERR_UNAUTHORIZED | 401 | Invalid or missing API key |
| ERR_FORBIDDEN | 403 | Access denied |
| ERR_TIMEOUT | 408 | Request timeout |
| ERR_MODEL_FAILURE | 500 | Model execution failed |
| ERR_DATABASE | 503 | Database connection error |

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERR_INVALID_INPUT",
    "message": "Invalid image URL format",
    "details": {
      "field": "imageUrl",
      "reason": "URL must start with http:// or https://"
    }
  },
  "requestId": "req_123abc"
}
```

## Rate Limiting

- Tier 1: 100 requests/minute
- Tier 2: 500 requests/minute
- Tier 3: Unlimited

Rate limit headers in response:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 92
X-RateLimit-Reset: 1641984000
```

## Webhooks

### Callback Format

When analysis completes, webhook is POSTed with:

```json
{
  "event": "analysis.completed",
  "analysisId": "ANALYSIS_20250112_001",
  "decision": "synthetic",
  "confidence": 0.927,
  "timestamp": "2025-01-12T10:30:50Z"
}
```

## SDKs & Libraries

- Python: `pip install forensic-analysis-sdk`
- JavaScript: `npm install forensic-analysis-sdk`
- Go: `go get github.com/forensic-analysis/sdk-go`

## Examples

### Python Example

```python
from forensic_analysis import Client

client = Client(api_key="sk_prod_xxxxx")

result = client.analyze(
    image_url="https://example.com/image.jpg",
    priority="high"
)

print(f"Decision: {result.decision}")
print(f"Confidence: {result.confidence}")

report = client.get_report(result.analysis_id, format="html")
```

### JavaScript Example

```javascript
import { ForensicAnalysis } from 'forensic-analysis-sdk'

const client = new ForensicAnalysis({ apiKey: 'sk_prod_xxxxx' })

const result = await client.analyze({
  imageUrl: 'https://example.com/image.jpg',
  priority: 'high'
})

console.log(`Decision: ${result.decision}`)
console.log(`Confidence: ${result.confidence}`)

const report = await client.getReport(result.analysisId, 'html')
```

## Support

- Email: support@forensic-analysis.com
- Documentation: https://docs.forensic-analysis.com
- GitHub: https://github.com/forensic-analysis
- Issues: https://github.com/forensic-analysis/issues
