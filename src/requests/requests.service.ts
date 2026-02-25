import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactRequest } from '../entities/contact-request.entity';
import { GraphicsRequest } from '../entities/graphics-request.entity';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(ContactRequest)
    private contactRequestRepository: Repository<ContactRequest>,
    @InjectRepository(GraphicsRequest)
    private graphicsRequestRepository: Repository<GraphicsRequest>,
  ) {}

  async createContactRequest(requestData: any) {
    const request = this.contactRequestRepository.create({
      name: requestData.name,
      email: requestData.email,
      subject: requestData.subject,
      message: requestData.message,
      status: 'Pending',
    });
    return await this.contactRequestRepository.save(request);
  }

  async createGraphicsRequest(requestData: any) {
    const request = this.graphicsRequestRepository.create({
      name: requestData.name,
      email: requestData.email,
      phone: requestData.phone || null,
      bikeModel: requestData.bikeModel,
      bikeYear: requestData.bikeYear || null,
      designType: requestData.designType || null,
      designDescription: requestData.designDescription || null,
      budget: requestData.budget || null,
      timeline: requestData.timeline || null,
      status: 'Pending',
    });
    return await this.graphicsRequestRepository.save(request);
  }

  async getAllContactRequests() {
    return await this.contactRequestRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getAllGraphicsRequests() {
    return await this.graphicsRequestRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async updateRequestStatus(type: 'contact' | 'graphics', id: number, status: string) {
    if (type === 'contact') {
      const request = await this.contactRequestRepository.findOne({ where: { id } });
      if (request) {
        request.status = status;
        return await this.contactRequestRepository.save(request);
      }
    } else {
      const request = await this.graphicsRequestRepository.findOne({ where: { id } });
      if (request) {
        request.status = status;
        return await this.graphicsRequestRepository.save(request);
      }
    }
    return null;
  }
}





