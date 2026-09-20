export interface OcrExtractedData {
  extractedAmount?: number;
  extractedReference?: string;
  extractedDate?: Date;
  extractedSender?: string;
  extractedRecipient?: string;
  extractedBank?: string;
  extractedNarration?: string;
  rawText: string;
  confidenceScore: number;
  warnings: string[];
  requiresManualVerification: boolean;
}

export interface OcrEngine {
  processDocument(buffer: Buffer, mimeType: string): Promise<OcrExtractedData>;
}
