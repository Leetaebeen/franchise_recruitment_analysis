// backend/src/users/users.service.ts

import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service'; // DB 서비스 불러오기
import * as bcrypt from 'bcrypt'; // 암호화 도구

@Injectable()
export class UsersService {
  // DB 사용을 위해 PrismaService 주입
  constructor(private readonly prisma: PrismaService) {}

  // 1. 회원가입 (Create)
  async create(createUserDto: CreateUserDto) {
    const { username, password } = createUserDto;

    // (1) 아이디 중복 체크
    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new ConflictException('이미 존재하는 아이디입니다.');
    }

    // (2) 비밀번호 암호화 (해싱)
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // (3) DB에 저장
    try {
      const user = await this.prisma.user.create({
        data: {
          username,
          password: hashedPassword,
        },
      });
      
      // 비밀번호는 빼고 리턴 (보안상)
      const { password: _, ...result } = user;
      return {
        message: '회원가입이 완료되었습니다.',
        user: result,
      };
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  // 2. 전체 조회 (나중에 관리자용)
  findAll() {
    return this.prisma.user.findMany();
  }

  // 3. 한명 조회
  findOne(username: string) {
    return this.prisma.user.findUnique({ where: { username } });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}