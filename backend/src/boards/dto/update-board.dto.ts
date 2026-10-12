import { IsString, IsOptional, MaxLength, Allow } from 'class-validator';

export class UpdateBoardDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  content?: Record<string, any>;

  @Allow()
  @IsOptional()
  folderId?: string | null;
}
