import { Module } from '@nestjs/common';
import { ParserService } from './parser.service';
import { ParserController } from './parser.controller';
import { BrowserModule } from '../browser/browser.module';
import { CaptchaModule } from '../captcha/captcha.module';

@Module({
  imports: [BrowserModule, CaptchaModule],
  controllers: [ParserController],
  providers: [ParserService],
  exports: [ParserService],
})
export class ParserModule {}

