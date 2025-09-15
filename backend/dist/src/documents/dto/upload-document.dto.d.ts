export declare enum DocumentType {
    ID_PROOF = "id_proof",
    PHOTO = "photo",
    MARKSHEET = "marksheet",
    CERTIFICATE = "certificate",
    RESUME = "resume",
    EXPERIENCE_LETTER = "experience_letter",
    QUALIFICATION = "qualification",
    OTHER = "other"
}
export declare class UploadDocumentDto {
    type: DocumentType;
    description?: string;
}
export declare class DocumentResponseDto {
    id: string;
    type: DocumentType;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    status: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}
