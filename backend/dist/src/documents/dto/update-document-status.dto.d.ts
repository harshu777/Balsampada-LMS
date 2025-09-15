import { DocumentStatus } from '@prisma/client';
export declare class UpdateDocumentStatusDto {
    status: DocumentStatus;
    reviewNotes?: string;
}
