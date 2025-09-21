/**
 * GET /export handler
 * Returns CSV export of spending data and recommendations
 */
import { FastifyRequest, FastifyReply } from 'fastify';
import fs from 'fs/promises';
import path from 'path';
import { exportQuerySchema, ExportQuery } from '../schemas/export';

// Simulate network latency for realistic testing
const simulateLatency = async (): Promise<void> => {
  if (process.env.SIMULATE_LATENCY === '1') {
    const latency = parseInt(process.env.LATENCY_MS || '150', 10);
    await new Promise(resolve => setTimeout(resolve, latency));
  }
};

// CSV helper functions
function escapeCSVField(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  const stringValue = String(value);
  
  // If the field contains comma, double quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

function generateCSV(headers: string[], rows: any[][]): string {
  const csvHeaders = headers.map(escapeCSVField).join(',');
  const csvRows = rows.map(row => 
    row.map(escapeCSVField).join(',')
  ).join('\n');
  
  return `${csvHeaders}\n${csvRows}`;
}

async function generateSpendingCSV(): Promise<string> {
  const FIXTURES_PATH = path.join(__dirname, '../fixtures');
  
  try {
    const spendData = JSON.parse(
      await fs.readFile(path.join(FIXTURES_PATH, 'spend.json'), 'utf-8')
    );

    const headers = [
      'Service',
      'Current Month ($)',
      'Previous Month ($)',
      'Change (%)',
      'Trend',
      'Resource Count'
    ];

    const rows = spendData.services?.map((service: any) => [
      service.name,
      service.currentCost,
      service.previousCost,
      service.changePercent,
      service.trend,
      service.resourceCount || 0
    ]) || [];

    return generateCSV(headers, rows);
  } catch (error) {
    // Fallback data if fixture not available
    const headers = [
      'Service',
      'Current Month ($)',
      'Previous Month ($)',
      'Change (%)',
      'Trend',
      'Resource Count'
    ];

    const rows = [
      ['EC2', '1250.45', '1100.20', '+13.7', 'increasing', '25'],
      ['S3', '89.32', '92.15', '-3.1', 'decreasing', '15'],
      ['RDS', '445.78', '430.22', '+3.6', 'stable', '3']
    ];

    return generateCSV(headers, rows);
  }
}

async function generateRecommendationsCSV(): Promise<string> {
  const FIXTURES_PATH = path.join(__dirname, '../fixtures');
  
  try {
    const recommendationsData = JSON.parse(
      await fs.readFile(path.join(FIXTURES_PATH, 'recommendations.json'), 'utf-8')
    );

    const headers = [
      'Title',
      'Impact',
      'Potential Savings ($)',
      'Effort',
      'Type',
      'Priority',
      'Status'
    ];

    const rows = recommendationsData.recommendations?.map((rec: any) => [
      rec.title,
      rec.impact,
      rec.potentialSavings,
      rec.effort,
      rec.type,
      rec.priority,
      rec.status
    ]) || [];

    return generateCSV(headers, rows);
  } catch (error) {
    // Fallback data if fixture not available
    const headers = [
      'Title',
      'Impact',
      'Potential Savings ($)',
      'Effort',
      'Type',
      'Priority',
      'Status'
    ];

    const rows = [
      ['Right-size EC2 instances', 'high', '450.00', 'medium', 'optimization', 'high', 'pending'],
      ['Enable S3 intelligent tiering', 'medium', '125.50', 'low', 'storage', 'medium', 'pending'],
      ['Schedule EC2 instances', 'high', '890.25', 'high', 'scheduling', 'high', 'pending']
    ];

    return generateCSV(headers, rows);
  }
}

export async function exportHandler(
  request: FastifyRequest<{ Querystring: ExportQuery }>,
  reply: FastifyReply
) {
  // Validate query parameters
  const validatedQuery = exportQuerySchema.parse(request.query);

  // Simulate network latency
  await simulateLatency();

  try {
    let csvContent: string;
    let filename: string;

    switch (validatedQuery.type) {
      case 'spending':
        csvContent = await generateSpendingCSV();
        filename = `spending-export-${new Date().toISOString().split('T')[0]}.csv`;
        break;
      
      case 'recommendations':
        csvContent = await generateRecommendationsCSV();
        filename = `recommendations-export-${new Date().toISOString().split('T')[0]}.csv`;
        break;
      
      case 'full':
        // Combine both spending and recommendations data
        const spendingCSV = await generateSpendingCSV();
        const recommendationsCSV = await generateRecommendationsCSV();
        
        csvContent = `SPENDING DATA\n${spendingCSV}\n\nRECOMMENDATIONS DATA\n${recommendationsCSV}`;
        filename = `full-export-${new Date().toISOString().split('T')[0]}.csv`;
        break;
      
      default:
        return reply.status(400).send({
          error: 'Invalid export type',
          message: 'Export type must be one of: spending, recommendations, full'
        });
    }

    // Set CSV response headers
    reply.header('Content-Type', 'text/csv');
    reply.header('Content-Disposition', `attachment; filename="${filename}"`);
    reply.header('Cache-Control', 'no-cache');

    return reply.send(csvContent);
  } catch (error) {
    request.log.error(error, 'Failed to generate export');
    return reply.status(500).send({
      error: 'Export generation failed',
      message: 'Unable to generate the requested export data'
    });
  }
}