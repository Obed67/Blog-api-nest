import { IsNotEmpty, IsEmail } from 'class-validator';

export class SignupDto {
  @IsNotEmpty()
  readonly username: string;
  @IsEmail()
  readonly email: string;
  @IsNotEmpty()
  readonly password: string;
}
