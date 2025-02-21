import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Request, Response } from 'express';
import * as path from 'path';
import { GithubService } from '../services/GithubService.js';

@Injectable()
export class VuefinderService {
    private adapters: Map<string, any> = new Map();
    readonly owner: string = process.env.GITHUB_OWNER!;
    readonly repo: string = process.env.GITHUB_REPO!;
    readonly token: string = process.env.GITHUB_API_KEY!;

    githubService = new GithubService()

    constructor() {
      this.adapters.set('null', 'root')
    }

    toVueFinderResource(input_json: any) {
      if (input_json.path == '/') {
        input_json.path = ''
      }
        return {
            type: input_json.type,
            path: input_json.path,
            visibility: "public",
            last_modified: Date.now() / 1000,
            basename: input_json.name,
            extension: input_json.name,
            file_size: input_json.size,
        };
    }

    private getAdapter(key: string) {
      return this.adapters.get(key) || this.adapters.get('null')
    }

    async index(req: any, res: any, filter?: string | null) {
        // console.log('This is inside the index function', req.query)
        // console.log(req)
        let path: any = ''
        const adapter = req.query.adapter as string || 'null'

        // Change the hard coding of the && condition?
        if (req.query.filter != null) {
          path = req.query.filter
        } else if (req.query.path != null && !req.query.path.includes('://')) {
            path = req.query.path
        } else if (req.query.path != null && req.query.path.includes('null://')) {
            path = req.query.path.substring(7)
        }
        // console.log("This is the path i am sending to getContent", path)
        let response = await this.githubService.getContent(path, req.query.branch)
        let output_list: any[] = response.map(this.toVueFinderResource)
           
        res.json({
            // Figure out the get_adapter stuff and the other helper functions to get full functionality
            adapter,
            storages: Array.from(this.adapters.keys()),
            dirname: path,
            files: output_list
        })
    }

    search(req: any, res: any) {
        console.log('Inisde the search function', req.query)
        return this.index(req, res)
    }

    async upload(file: any, req: any, res: any) {
      // console.log('This is inside upload', req.query)
      let name: string
      if (req.query.path == '') {
        name = file.originalname
      } else {
        name = req.query.path + '/' + file.originalname
      }
      // console.log(req.query.branch, name)
        await this.githubService.uploadFile(req.query.branch, name, file.buffer)
        return await this.index(req, res)
    }

    async delete(body: any, req: Request, res: Response) {
        let a: any;
        for (a in body.items) {
          let name = body.items[a].path
          await this.githubService.deleteContent(name, 'new-branch')
        }
        return await this.index(req, res)
    }

}