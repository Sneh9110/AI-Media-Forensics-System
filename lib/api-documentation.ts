/**
 * API Documentation Service
 * Provides comprehensive API documentation and code examples
 */

export interface APIEndpoint {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  path: string
  name: string
  description: string
  auth: boolean
  rateLimit: string
  params?: Array<{
    name: string
    type: string
    required: boolean
    description: string
  }>
  response: {
    status: number
    description: string
    example: any
  }
  errors?: Array<{
    status: number
    description: string
  }>
  examples: {
    curl: string
    javascript: string
    python: string
  }
}

export const API_ENDPOINTS: APIEndpoint[] = [
  {
    method: 'POST',
    path: '/api/analyze',
    name: 'Analyze Media',
    description: 'Upload and analyze an image or video file for AI generation and manipulation detection',
    auth: false,
    rateLimit: '10 per minute',
    params: [
      {
        name: 'file',
        type: 'FormData (File)',
        required: true,
        description: 'The image or video file to analyze (JPG, PNG, MP4, MOV, AVI)',
      },
    ],
    response: {
      status: 200,
      description: 'Analysis started successfully',
      example: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        status: 'processing',
        message: 'High-accuracy ensemble AI detection started',
        enhancedDetectionEnabled: true,
        airiaAgentEnabled: true,
        ensembleSystemEnabled: true,
      },
    },
    errors: [
      { status: 400, description: 'No file provided or invalid file format' },
      { status: 413, description: 'File size exceeds 20MB limit' },
      { status: 500, description: 'Internal server error' },
    ],
    examples: {
      curl: `curl -X POST -F "file=@image.jpg" http://localhost:3000/api/analyze`,
      javascript: `
const formData = new FormData();
formData.append('file', fileInput.files[0]);
const response = await fetch('/api/analyze', {
  method: 'POST',
  body: formData
});
const data = await response.json();
console.log(data.id); // Analysis ID
      `.trim(),
      python: `
import requests
with open('image.jpg', 'rb') as f:
    files = {'file': f}
    response = requests.post('http://localhost:3000/api/analyze', files=files)
    print(response.json()['id'])
      `.trim(),
    },
  },
  {
    method: 'GET',
    path: '/api/status',
    name: 'Check Analysis Status',
    description: 'Retrieve the status and results of a specific analysis',
    auth: false,
    rateLimit: '30 per minute',
    params: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: 'The analysis ID returned from /api/analyze endpoint',
      },
    ],
    response: {
      status: 200,
      description: 'Status retrieved successfully',
      example: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        status: 'completed',
        result: {
          prediction: 'synthetic',
          confidence: 0.94,
          ensembleScore: 0.88,
          heatmap: 'data:image/png;base64,...',
          metadata: {
            spatialScore: 0.85,
            frequencyScore: 0.92,
            aiGenerationScore: 0.94,
            deepfakeScore: 0.12,
            manipulationScore: 0.18,
            prnuSensorScore: 0.76,
          },
          processingTime: 474,
        },
      },
    },
    errors: [
      { status: 400, description: 'Analysis ID not provided' },
      { status: 404, description: 'Analysis not found' },
      { status: 500, description: 'Internal server error' },
    ],
    examples: {
      curl: `curl http://localhost:3000/api/status?id=a1b2c3d4-e5f6-7890-abcd-ef1234567890`,
      javascript: `
const analysisId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const response = await fetch(\`/api/status?id=\${analysisId}\`);
const status = await response.json();
console.log(status.result);
      `.trim(),
      python: `
import requests
analysis_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
response = requests.get(f'http://localhost:3000/api/status?id={analysis_id}')
print(response.json()['result'])
      `.trim(),
    },
  },
  {
    method: 'GET',
    path: '/api/analyses',
    name: 'List Analyses',
    description: 'Retrieve all analysis records from the database',
    auth: false,
    rateLimit: '20 per minute',
    params: [],
    response: {
      status: 200,
      description: 'List of all analyses',
      example: [
        {
          id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          fileName: 'image.jpg',
          analysisStatus: 'completed',
          authenticity: {
            prediction: 'synthetic',
            confidence: 0.94,
          },
          uploadedAt: '2025-12-10T10:30:00Z',
        },
      ],
    },
    errors: [{ status: 500, description: 'Internal server error' }],
    examples: {
      curl: `curl http://localhost:3000/api/analyses`,
      javascript: `
const response = await fetch('/api/analyses');
const analyses = await response.json();
console.log(analyses);
      `.trim(),
      python: `
import requests
response = requests.get('http://localhost:3000/api/analyses')
print(response.json())
      `.trim(),
    },
  },
]

export function getEndpointByPath(path: string): APIEndpoint | undefined {
  return API_ENDPOINTS.find((ep) => ep.path === path)
}

export function getAllEndpoints(): APIEndpoint[] {
  return API_ENDPOINTS
}
/**
 * Data export utility for analysis results
 * Supports CSV, JSON, and XML formats
 */
export class DataExporter {
  exportToCSV<T>(data: T[], headers: (keyof T)[]): string {
    const csvHeaders = headers.join(",")
    const csvRows = data.map((item) =>
      headers
        .map((header) => {
          const value = item[header]
          const stringValue = typeof value === "string" ? value : JSON.stringify(value)
          return `"${stringValue.replace(/"/g, '""')}"`
        })
        .join(",")
    )

    return [csvHeaders, ...csvRows].join("\n")
  }

  exportToJSON<T>(data: T[], pretty: boolean = true): string {
    return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data)
  }

  exportToXML<T>(data: T[], rootElement: string = "root"): string {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${rootElement}>\n`

    for (const item of data) {
      xml += "  <item>\n"
      for (const [key, value] of Object.entries(item || {})) {
        const stringValue = typeof value === "string" ? value : JSON.stringify(value)
        xml += `    <${key}>${stringValue}</${key}>\n`
      }
      xml += "  </item>\n"
    }

    xml += `</${rootElement}>`
    return xml
  }

  downloadCSV<T>(data: T[], headers: (keyof T)[], filename: string): void {
    const csv = this.exportToCSV(data, headers)
    this.triggerDownload(csv, filename, "text/csv")
  }

  downloadJSON<T>(data: T[], filename: string): void {
    const json = this.exportToJSON(data, true)
    this.triggerDownload(json, filename, "application/json")
  }

  private triggerDownload(content: string, filename: string, type: string): void {
    if (typeof window !== "undefined") {
      const blob = new Blob([content], { type })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      a.click()
      window.URL.revokeObjectURL(url)
    }
  }
}

export const dataExporter = new DataExporter()