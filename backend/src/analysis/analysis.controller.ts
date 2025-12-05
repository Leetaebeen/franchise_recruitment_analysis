import { Controller, Post, Get, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AnalysisService } from './analysis.service';
import { AuthGuard } from '@nestjs/passport'; // 👈 필수

// 👇 [핵심] 여기에 Guard가 있어야 토큰 검사를 합니다!
@UseGuards(AuthGuard('jwt')) 
@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.analysisService.uploadAndAnalyze(file);
  }

  @Get('stats')
  getStats() {
    return this.analysisService.getNationwideStats();
  }

  @Post('reset')
  resetData() {
    return this.analysisService.clearAllData();
  }
}