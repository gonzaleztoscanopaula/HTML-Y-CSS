import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() body: { email: string; password: string }) {
    console.log('Received data:', body);
    const { email, password } = body;
    try {
      const user = await this.userService.createUser(email, password);
      return { message: 'Cuenta creada con éxito', user };
    } catch (error) {
      console.error('Error:', error);
      throw new HttpException('Error al crear cuenta', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const { email, password } = body;
    const user = await this.userService.findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new HttpException('Correo electrónico o contraseña incorrectos', HttpStatus.UNAUTHORIZED);
    }

    const token = jwt.sign({ id: user.id }, 'secret_key', { expiresIn: '1h' });
    return { message: 'Inicio de sesión exitoso', token };
  }

  // Nuevo método para la recuperación de contraseña
  @Post('recover-password')
  async recoverPassword(@Body('email') email: string) {
    try {
      const user = await this.userService.findUserByEmail(email);
      if (!user) {
        throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
      }

      // Aquí puedes agregar la lógica para generar un token de recuperación de contraseña
      // y enviarlo por correo electrónico. Esto es un ejemplo básico.
      const resetToken = jwt.sign({ id: user.id }, 'secret_key', { expiresIn: '15m' });
      
      // Simular envío de correo (en un entorno real, deberías usar un servicio de correo electrónico)
      console.log(`Enviando email a ${email} con el token de recuperación: ${resetToken}`);

      return { message: 'Se han enviado las instrucciones a tu correo electrónico.' };
    } catch (error) {
      console.error('Error al recuperar contraseña:', error);
      throw new HttpException('Error al recuperar contraseña', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
