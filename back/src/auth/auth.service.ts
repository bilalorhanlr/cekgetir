import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly validCredentials = {
    email: 'info@cekgetir.com',
    password: '123',
  };

  constructor(private jwtService: JwtService) {}

  async validateUser(email: string, password: string): Promise<any> {
    if (
      email === this.validCredentials.email &&
      password === this.validCredentials.password
    ) {
      const payload = { email: this.validCredentials.email, sub: 1 };
      return {
        access_token: this.jwtService.sign(payload),
      };
    }
    throw new UnauthorizedException('Invalid credentials');
  }
} 