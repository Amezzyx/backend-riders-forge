import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async register(registerDto: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<{ user: User; token?: string }> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new Error('This email has been signed in');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const name = registerDto.firstName && registerDto.lastName
      ? `${registerDto.firstName} ${registerDto.lastName}`
      : registerDto.email.split('@')[0];

    const userData: Partial<User> = {
      email: registerDto.email,
      password: hashedPassword,
      name,
      firstName: registerDto.firstName || undefined,
      lastName: registerDto.lastName || undefined,
      isAdmin: registerDto.email.includes('admin') || registerDto.email === 'admin@ridersforge.com',
    };

    const user = this.userRepository.create(userData);
    const savedUserResult = await this.userRepository.save(user);
    
    // TypeORM save() can return T | T[], but we know it's a single entity here
    if (Array.isArray(savedUserResult)) {
      throw new Error('Unexpected array returned from save');
    }
    
    const savedUser: User = savedUserResult;

    // Remove password from response
    const { password: _, ...userWithoutPassword } = savedUser;

    return {
      user: userWithoutPassword as User,
    };
  }

  async login(loginDto: { email: string; password: string }): Promise<{ user: User; token?: string }> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as User,
    };
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  async updateProfile(id: string, profileData: Partial<User>): Promise<User> {
    await this.userRepository.update(id, profileData);
    return await this.getUserById(id);
  }

  async getAllUsers(): Promise<User[]> {
    const users = await this.userRepository.find({
      order: { createdAt: 'DESC' },
    });
    // Remove passwords from all users
    return users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    });
  }

  async addAddress(userId: string, addressData: any): Promise<User> {
    const user = await this.getUserById(userId);
    const addresses = user.addresses || [];
    
    // Generate ID for new address
    const newAddress = {
      ...addressData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };

    // If this is set as default, unset other defaults
    if (newAddress.isDefault) {
      addresses.forEach(addr => { addr.isDefault = false; });
    }

    addresses.push(newAddress);
    await this.userRepository.update(userId, { addresses });
    return await this.getUserById(userId);
  }

  async updateAddress(userId: string, addressId: string, addressData: any): Promise<User> {
    const user = await this.getUserById(userId);
    const addresses = user.addresses || [];
    const addressIndex = addresses.findIndex(addr => addr.id === addressId);
    
    if (addressIndex === -1) {
      throw new Error('Address not found');
    }

    // If this is set as default, unset other defaults
    if (addressData.isDefault) {
      addresses.forEach((addr, index) => {
        if (index !== addressIndex) {
          addr.isDefault = false;
        }
      });
    }

    addresses[addressIndex] = { ...addresses[addressIndex], ...addressData };
    await this.userRepository.update(userId, { addresses });
    return await this.getUserById(userId);
  }

  async deleteAddress(userId: string, addressId: string): Promise<User> {
    const user = await this.getUserById(userId);
    const addresses = (user.addresses || []).filter(addr => addr.id !== addressId);
    await this.userRepository.update(userId, { addresses });
    return await this.getUserById(userId);
  }

  async addPaymentMethod(userId: string, paymentData: any): Promise<User> {
    const user = await this.getUserById(userId);
    const paymentMethods = user.paymentMethods || [];
    
    // Generate ID for new payment method
    const newPaymentMethod = {
      ...paymentData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };

    // If this is set as default, unset other defaults
    if (newPaymentMethod.isDefault) {
      paymentMethods.forEach(method => { method.isDefault = false; });
    }

    paymentMethods.push(newPaymentMethod);
    await this.userRepository.update(userId, { paymentMethods });
    return await this.getUserById(userId);
  }

  async updatePaymentMethod(userId: string, methodId: string, paymentData: any): Promise<User> {
    const user = await this.getUserById(userId);
    const paymentMethods = user.paymentMethods || [];
    const methodIndex = paymentMethods.findIndex(method => method.id === methodId);
    
    if (methodIndex === -1) {
      throw new Error('Payment method not found');
    }

    // If this is set as default, unset other defaults
    if (paymentData.isDefault) {
      paymentMethods.forEach((method, index) => {
        if (index !== methodIndex) {
          method.isDefault = false;
        }
      });
    }

    paymentMethods[methodIndex] = { ...paymentMethods[methodIndex], ...paymentData };
    await this.userRepository.update(userId, { paymentMethods });
    return await this.getUserById(userId);
  }

  async deletePaymentMethod(userId: string, methodId: string): Promise<User> {
    const user = await this.getUserById(userId);
    const paymentMethods = (user.paymentMethods || []).filter(method => method.id !== methodId);
    await this.userRepository.update(userId, { paymentMethods });
    return await this.getUserById(userId);
  }
}
