export declare enum QuestionType {
    MCQ = "MCQ",
    SHORT_ANSWER = "SHORT_ANSWER",
    ESSAY = "ESSAY",
    TRUE_FALSE = "TRUE_FALSE",
    FILL_BLANK = "FILL_BLANK"
}
export declare class QuestionOptionDto {
    text: string;
    isCorrect?: boolean;
}
export declare class QuestionDto {
    question: string;
    type: QuestionType;
    marks: number;
    options?: QuestionOptionDto[];
    correctAnswer?: string;
    explanation?: string;
    isRequired?: boolean;
}
export declare class CreateTestDto {
    title: string;
    description?: string;
    subjectId: string;
    questions: QuestionDto[];
    totalMarks: number;
    duration: number;
    startTime: string;
    endTime: string;
    isActive?: boolean;
    allowMultipleAttempts?: boolean;
    showResultsImmediately?: boolean;
    shuffleQuestions?: boolean;
}
