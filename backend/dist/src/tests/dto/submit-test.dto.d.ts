export declare class AnswerDto {
    questionId: string;
    answer?: string;
    selectedOptions?: string[];
}
export declare class SubmitTestDto {
    testId: string;
    answers: AnswerDto[];
}
export declare class StartTestDto {
    testId: string;
}
