import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CurrentUser } from './dto/current-user.dto';

export interface JwtPayload {
  sub: string; // User ID
  email: string;
  userName: string;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key', // In production, use environment variable
    });
  }

  async validate(payload: JwtPayload): Promise<CurrentUser> {
    // AWS API Gateway will validate the JWT token, so we can trust the payload
    // Return user information that will be available in request.user
    return {
      id: payload.sub,
      email: payload.email,
      userName: payload.userName,
      role: payload.role,
    };
  }
}
