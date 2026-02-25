import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { RequestsService } from './requests.service';

@Controller('api/requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post('contact')
  async createContactRequest(@Body() requestData: any) {
    return await this.requestsService.createContactRequest(requestData);
  }

  @Post('graphics')
  async createGraphicsRequest(@Body() requestData: any) {
    return await this.requestsService.createGraphicsRequest(requestData);
  }

  @Get('contact')
  async getAllContactRequests() {
    return await this.requestsService.getAllContactRequests();
  }

  @Get('graphics')
  async getAllGraphicsRequests() {
    return await this.requestsService.getAllGraphicsRequests();
  }

  @Put(':type/:id/status')
  async updateRequestStatus(
    @Param('type') type: string,
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return await this.requestsService.updateRequestStatus(
      type as 'contact' | 'graphics',
      parseInt(id),
      body.status,
    );
  }
}





