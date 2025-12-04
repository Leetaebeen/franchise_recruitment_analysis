import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common'; // 👈 import 추가
import { AuthGuard } from '@nestjs/passport'; // 👈 import 추가 (Passport의 기본 Guard)
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

// UseGuards는 모듈 상단에 적용할 수도 있지만, 우선 함수 단위로 적용
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // 💡 [핵심] 여기에 @UseGuards를 적용합니다. 
  // 'jwt' 전략을 사용해서 토큰이 있는지 검사하라는 뜻입니다.
  @UseGuards(AuthGuard('jwt')) 
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
  
  // 로그인한 유저의 정보만 가져오는 API (테스트용)
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Req() req) { // @Req()로 요청 객체를 가져옴
    // 가드 통과 후, req.user에 유저 정보(payload)가 담겨 있습니다.
    return { 
        message: "인증 성공! 이 정보는 보호됩니다.",
        user: req.user
    };
  }

  // ... (나머지 findOne, Patch, Delete 함수들은 생략 또는 필요에 따라 Guard 추가)
}