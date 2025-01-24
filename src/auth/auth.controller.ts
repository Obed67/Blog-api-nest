import { Body, Controller, Delete, Post, Req, UseGuards } from '@nestjs/common';
import { SignupDto } from './dto/signupDto';
import { AuthService } from './auth.service';
import { SigninDto } from './dto/signinDto';
import { ResetPasswordDemandDto } from './dto/resetPasswordDto';
import { ResetPasswordConfirmation } from './dto/resetPasswordConfirmationDto';
import { AuthGuard } from '@nestjs/passport';
import { request } from 'http';

@Controller('auth')
export class AuthController {
  constructor(private readonly authservice : AuthService) {}

  @Post('signup')
  signup(@Body() signupDto: SignupDto) {
    return this.authservice.signup(signupDto)
  }

  @Post('signin')
  signin(@Body() signinDto: SigninDto) {
    return this.authservice.signin(signinDto)
  }

  @Post('reset-password')
  resetPasswordDemand(@Body() resetPasswordDto: ResetPasswordDemandDto) {
    return this.authservice.resetPasswordDemand(resetPasswordDto)
  }

  @Post('reset-password-confirmation')
  resetPasswordConfirmation(@Body() resetPasswordConfirmation: ResetPasswordConfirmation) {
    return this.authservice.resetPasswordConfirmation(resetPasswordConfirmation)
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('delete-account')
  deleteAccount(@Req() resquest : Request) {

    return request.user;
  }
}
