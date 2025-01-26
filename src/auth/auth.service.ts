import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { SignupDto } from './dto/signupDto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from "bcrypt";
import * as speakeasy from "speakeasy";
import { MailerService } from 'src/mailer/mailer.service';
import { SigninDto } from './dto/signinDto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ResetPasswordDemandDto } from './dto/resetPasswordDto';
import { ResetPasswordConfirmation } from './dto/resetPasswordConfirmationDto';
import { DeleteAccountDto } from './dto/deleteAccountDto';


@Injectable()
export class AuthService {
    
    constructor(
        private readonly prismaService : PrismaService,
        private readonly mailerService : MailerService,
        private readonly jwtService : JwtService,
        private readonly configService : ConfigService
    ){}

    async signup(signupDto: SignupDto) {
        const {email, password, username} = signupDto
        // Vérifier si l'utilisateur est déjà inscrit
            const user = await this.prismaService.user.findUnique({where : {email}})
            if(user) throw new ConflictException("User already exists");
        // Hasher le mot de passe
            const hashedPassword = await bcrypt.hash(password, 10);
        // Enregistrer l'utilisateur dans la base de données
            await this.prismaService.user.create({
                data : {email, username, password : hashedPassword }
            });
        // Envoyer un email de confirmation
            await this.mailerService.sendSignupConfirmation(email)
        // Retourner une réponse de succès
            return { data: "User successfully created" };
    }

    async signin(signinDto: SigninDto) {
        const { email, password } = signinDto
        // Vérifier si l'utilisateur est déjà inscrit
            const user = await this.prismaService.user.findUnique({where : {email}})
            if(!user) throw new NotFoundException('User not found');
        // Comparer le mot de passe
            const match = await bcrypt.compare(password, user.password)
            if(!match) throw new UnauthorizedException("Password does not match")
        // Retourner un token jwt
            const payload = {
                sub : user.userId,
                email : user.email
            }
            const token = this.jwtService.sign(payload, {
                expiresIn : '1h', 
                secret : this.configService.get('JWT_SECRET')
            });

            return { 
                token, user : {
                    username : user.username,
                    email : user.email
                } 
            }
    }

    async resetPasswordDemand(resetPasswordDemandDto: ResetPasswordDemandDto) {
        const { email, password } = resetPasswordDemandDto
        // Trouver l'utilisateur si il exite
            const user = await this.prismaService.user.findUnique({where : {email : resetPasswordDemandDto.email}})
            if(!user) throw new NotFoundException('User not found');

        // Générer un code OTP
            const code = speakeasy.totp( {
                secret : this.configService.get('OTP_CODE') || 'default_secret',
                digits: 8,
                step: 60 * 15,
                encoding: 'base32'
            })

        // Envoyer le code OTP par email
            const url = "http://localhost:3000/auth/reset-password-confirmation"
            await this.mailerService.sendResetPasswordConfirmation(email, code, url)
            return { data : "Reset password mail has been sent by email" }
    }

    async resetPasswordConfirmation(resetPasswordConfirmation: ResetPasswordConfirmation) {
        const { email, password, code } = resetPasswordConfirmation
        // Trouver l'utilisateur si il exites
            const user = await this.prismaService.user.findUnique({where : {email}})
            if(!user) throw new NotFoundException('User not found');

        // Vérifier le code OTP
            const match = speakeasy.totp.verify({
                secret: this.configService.get('OTP_CODE') || 'default_secret',
                token: code,
                digits: 8,
                step: 60 * 15,
                encoding: 'base32',
            });
            if(!match) throw new UnauthorizedException('Invalid/expired code')

        // Hasher le nouveau mot de passe
            const hashedPassword = await bcrypt.hash(password, 10);

        // Mettre à jour le mot de passe
            await this.prismaService.user.update({
                where : {email},
                data : {password : hashedPassword}
            })
        // Retourner une réponse de succès
            return { data : "Password successfully updated" }

    }

    async deleteAccount(userId: number, deleteAccountDto: DeleteAccountDto) {
        const { password } = deleteAccountDto
        // Trouver l'utilisateur si il exites
            const user = await this.prismaService.user.findUnique({where : {userId}})
            if(!user) throw new NotFoundException('User existe pas');

        // Comparer le mot de passe
            const match = await bcrypt.compare(password, user.password)
            if(!match) throw new UnauthorizedException("Password does not match")
            
        // Supprimer l'utilisateur
            await this.prismaService.user.delete({where : {userId}})
            return { data : "User successfully deleted" }
    }
}
