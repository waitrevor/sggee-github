import { Controller, Get, Post, Req, Res, Query, Param, UploadedFile, UseInterceptors } from '@nestjs/common';
import {FileInterceptor} from "@nestjs/platform-express";
import { VuefinderService } from '../services/VuefinderService.js';
import { Roles, Public } from '../auth/RolesDecorator.js';
import {UserGroupEnum} from "../models/UserCredentialTypes.js";
import { Volume } from 'memfs'

@Controller('vuefinder')
export class VuefinderController {
  constructor(private readonly vuefinderService: VuefinderService) {}

    @Get('/v1')
    @Roles([UserGroupEnum.ADMIN, UserGroupEnum.MAINTENANCE])
    async index(@Query('q') q: string, @Req() request: any, @Res() response: any) {
        console.log(q)
        // preview?

        const actionMap: Record<string, Function> = {
            index: () => this.vuefinderService.index(request, response),
            search: () => this.vuefinderService.search(request, response),
        }

        if (q in actionMap) {
            return actionMap[q]();
        } else {
            //TODO Create an actual error message
            throw new Error(`There is an error with ${q}`)
        }
        
    }
    
    @Post('/v1')
    @Roles([UserGroupEnum.ADMIN, UserGroupEnum.MAINTENANCE])
    @UseInterceptors(FileInterceptor('file'))
    posting(@Query('q') q: string, @Req() request: any, @Res() response: any, @UploadedFile() file: Express.Multer.File,) {
        console.log(q)

        const actionMap: Record<string, Function> = {
            upload: () => this.vuefinderService.upload(file, request, response),
            delete: () => this.vuefinderService.delete(request.body, request, response),
        }
        
        if (q in actionMap) {
            return actionMap[q]();
        } else {
            //TODO Create an actual error message that means something
            throw new Error(`There is an error with ${q}`)
        }

    }

}