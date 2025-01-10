import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsString } from 'class-validator';

export class CreateTransactionDto {
  @IsNumber()
  amount: number;

  @IsString()
  description: string;

  @IsString()
  type: string;

  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsString()
  categoryId: string;
}
