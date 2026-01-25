import { Body, Controller, Get, Post, Res, Req, HttpCode, UseGuards } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { Response, Request } from 'express'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { RefreshDto } from './dto/refresh.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser, type RequestUser } from '../../common/decorators/current-user.decorator'
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiExtraModels, ApiOkResponse, ApiTags, ApiUnauthorizedResponse, getSchemaPath } from '@nestjs/swagger'
import { ApiEnvelopeDto, ApiErrorResponseDto } from '../../common/dto/api-response.dto'
import { LoginResponseDto, RefreshResponseDto, LogoutResponseDto, MeResponseDto } from './dto/auth-response.dto'

const accessCookie = {
  name: 'accessToken',
  options: { httpOnly: true, sameSite: 'lax' as const, secure: false, maxAge: 30 * 60 * 1000, path: '/' }
}

const refreshCookie = {
  name: 'refreshToken',
  options: { httpOnly: true, sameSite: 'lax' as const, secure: false, maxAge: 7 * 24 * 60 * 60 * 1000, path: '/' }
}

@ApiTags('auth')
@ApiExtraModels(ApiEnvelopeDto, ApiErrorResponseDto, LoginResponseDto, RefreshResponseDto, LogoutResponseDto, MeResponseDto)
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60 } })
  @ApiCreatedResponse({
    description: 'Успешный вход',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiEnvelopeDto) },
        { properties: { data: { $ref: getSchemaPath(LoginResponseDto) } } }
      ]
    }
  })
  @ApiBadRequestResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiUnauthorizedResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.login(dto.email, dto.password)
    res.cookie(accessCookie.name, tokens.accessToken, accessCookie.options)
    res.cookie(refreshCookie.name, tokens.refreshToken, refreshCookie.options)
    return tokens
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOkResponse({
    description: 'Токен обновлен',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiEnvelopeDto) },
        { properties: { data: { $ref: getSchemaPath(RefreshResponseDto) } } }
      ]
    }
  })
  @ApiBadRequestResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiUnauthorizedResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  async refresh(@Req() req: Request, @Body() dto: RefreshDto, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken ?? dto.refreshToken
    const { accessToken } = await this.authService.refresh(refreshToken)
    res.cookie(accessCookie.name, accessToken, accessCookie.options)
    return { accessToken }
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOkResponse({
    description: 'Выход выполнен',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiEnvelopeDto) },
        { properties: { data: { $ref: getSchemaPath(LogoutResponseDto) } } }
      ]
    }
  })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(accessCookie.name, accessCookie.options)
    res.clearCookie(refreshCookie.name, refreshCookie.options)
    return { ok: true }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Текущий пользователь',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiEnvelopeDto) },
        { properties: { data: { $ref: getSchemaPath(MeResponseDto) } } }
      ]
    }
  })
  @ApiUnauthorizedResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  me(@CurrentUser() user: RequestUser) {
    return { id: user.id, email: user.email, role: user.role, permissions: user.permissions }
  }
}
