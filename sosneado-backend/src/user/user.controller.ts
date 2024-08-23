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
}
