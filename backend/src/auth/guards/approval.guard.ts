import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ApprovalGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const skipApproval = this.reflector.get<boolean>('skipApproval', context.getHandler());
    if (skipApproval) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Admin users are always approved
    if (user.role === 'ADMIN') {
      return true;
    }

    // Check if user is approved
    if (user.status !== 'APPROVED') {
      throw new ForbiddenException('Your account is pending approval. Please wait for admin approval to access this feature.');
    }

    return true;
  }
}