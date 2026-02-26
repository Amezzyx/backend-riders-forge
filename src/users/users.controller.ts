import { Controller, Get, Post, Body, Param, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() registerDto: any) {
    try {
      return await this.usersService.register(registerDto);
    } catch (error) {
      if (error.message && error.message.includes('has been signed in')) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException(error.message || 'Registration failed');
    }
  }

  @Post('login')
  async login(@Body() loginDto: any) {
    try {
      return await this.usersService.login(loginDto);
    } catch (error) {
      if (error.message && error.message.includes('Invalid email or password')) {
        throw new UnauthorizedException(error.message);
      }
      throw new UnauthorizedException(error.message || 'Login failed');
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    if (!body?.email || typeof body.email !== 'string') {
      throw new BadRequestException('Email is required');
    }
    return await this.usersService.requestPasswordReset(body.email.trim());
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    if (!body?.token || !body?.newPassword) {
      throw new BadRequestException('Token and new password are required');
    }
    if (typeof body.newPassword !== 'string' || body.newPassword.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }
    try {
      return await this.usersService.resetPassword(body.token, body.newPassword);
    } catch (error) {
      if (error.message && error.message.includes('Invalid or expired')) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException(error.message || 'Reset failed');
    }
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return await this.usersService.getUserById(id);
  }

  @Post(':id/profile')
  async updateProfile(@Param('id') id: string, @Body() profileData: any) {
    return await this.usersService.updateProfile(id, profileData);
  }

  @Post(':id/addresses')
  async addAddress(@Param('id') id: string, @Body() addressData: any) {
    return await this.usersService.addAddress(id, addressData);
  }

  @Post(':id/addresses/:addressId')
  async updateAddress(@Param('id') id: string, @Param('addressId') addressId: string, @Body() addressData: any) {
    return await this.usersService.updateAddress(id, addressId, addressData);
  }

  @Post(':id/addresses/:addressId/delete')
  async deleteAddress(@Param('id') id: string, @Param('addressId') addressId: string) {
    return await this.usersService.deleteAddress(id, addressId);
  }

  @Post(':id/payment-methods')
  async addPaymentMethod(@Param('id') id: string, @Body() paymentData: any) {
    return await this.usersService.addPaymentMethod(id, paymentData);
  }

  @Post(':id/payment-methods/:methodId')
  async updatePaymentMethod(@Param('id') id: string, @Param('methodId') methodId: string, @Body() paymentData: any) {
    return await this.usersService.updatePaymentMethod(id, methodId, paymentData);
  }

  @Post(':id/payment-methods/:methodId/delete')
  async deletePaymentMethod(@Param('id') id: string, @Param('methodId') methodId: string) {
    return await this.usersService.deletePaymentMethod(id, methodId);
  }
}


