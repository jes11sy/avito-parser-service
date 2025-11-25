import { Controller, Post, Get, Body, Param, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ParserService } from './parser.service';

@ApiTags('Parser')
@Controller('parser')
export class ParserController {
  private readonly logger = new Logger(ParserController.name);

  constructor(private readonly parserService: ParserService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login to Avito account' })
  async login(@Body() body: any) {
    try {
      const cookies = await this.parserService.login(body.account);
      return {
        success: true,
        cookies,
      };
    } catch (error: any) {
      this.logger.error('Login failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('chats')
  @ApiOperation({ summary: 'Get chats list' })
  async getChats(@Body() body: any) {
    try {
      const chats = await this.parserService.getChats(body.account);
      return {
        success: true,
        data: chats,
      };
    } catch (error: any) {
      this.logger.error('Get chats failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('messages')
  @ApiOperation({ summary: 'Get messages from chat' })
  async getMessages(@Body() body: any) {
    try {
      const messages = await this.parserService.getMessages(body.account, body.chatId);
      return {
        success: true,
        data: messages,
      };
    } catch (error: any) {
      this.logger.error('Get messages failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('send')
  @ApiOperation({ summary: 'Send message to chat' })
  async sendMessage(@Body() body: any) {
    try {
      await this.parserService.sendMessage(body.account, body.chatId, body.message);
      return {
        success: true,
      };
    } catch (error: any) {
      this.logger.error('Send message failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  async health() {
    return {
      success: true,
      service: 'avito-parser-service',
      status: 'running',
    };
  }
}

