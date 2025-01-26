import { IsNotEmpty, IsOptional } from "class-validator";

export class UpdatePostDtoCommentDto {
    @IsNotEmpty()
    @IsOptional()
    readonly content? : string;
}