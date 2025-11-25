import { Controller, Get, Post, Body, Param, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CaptchaService } from './captcha.service';

@ApiTags('Captcha')
@Controller('captcha')
export class CaptchaController {
  private readonly logger = new Logger(CaptchaController.name);

  constructor(private readonly captchaService: CaptchaService) {}

  @Get('pending')
  @ApiOperation({ summary: 'Get all pending captchas' })
  async getPendingCaptchas() {
    const captchas = this.captchaService.getPendingCaptchas();
    return {
      success: true,
      data: captchas,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get captcha by ID' })
  async getCaptcha(@Param('id') id: string) {
    const captcha = this.captchaService.getCaptcha(id);
    if (!captcha) {
      return {
        success: false,
        error: 'Captcha not found',
      };
    }
    return {
      success: true,
      data: captcha,
    };
  }

  @Post('submit')
  @ApiOperation({ summary: 'Submit captcha answer' })
  async submitAnswer(@Body() body: { captchaId: string; answer: string }) {
    try {
      const success = await this.captchaService.submitCaptchaAnswer(
        body.captchaId,
        body.answer,
      );
      
      if (!success) {
        return {
          success: false,
          error: 'Captcha not found or already resolved',
        };
      }

      return {
        success: true,
        message: 'Captcha answer submitted',
      };
    } catch (error: any) {
      this.logger.error('Submit captcha failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

