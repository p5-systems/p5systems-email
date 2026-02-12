import { Controller, Get, Req, UseGuards, Res } from "@nestjs/common";
import { OauthGuard } from "./guards/oauth.guard";
import { AuthService } from "./auth.service";
import type { Request, Response } from "express";

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Get("login")
    @UseGuards(OauthGuard)
    login() {
        // initiates the oauth flow
    }

    @Get("callback")
    @UseGuards(OauthGuard)
    callback(@Req() req: Request & { user: { email: string } }, @Res() res: Response) {
        const token = this.authService.generateJwt({ email: req.user.email });
        res.cookie("auth-token", token, { httpOnly: true });
        // TODO: redirect to frontend
        res.redirect("http://localhost:3000");
    }
}
