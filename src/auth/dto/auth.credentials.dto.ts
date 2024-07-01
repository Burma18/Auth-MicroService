import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class SendOtp {
  @IsEmail()
  email: string;
}

export class validateOtp {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 6)
  otp: string;
}

export class LoginAdminDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
