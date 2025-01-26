import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { PostService } from './post.service';
import { AuthGuard } from '@nestjs/passport';
import { CreatePostDto } from './dto/createPostDto';
import { UpdatePostDto } from './dto/updatePostDto';

@Controller('post')
export class PostController {
    constructor(private readonly postService: PostService) {}

    @UseGuards(AuthGuard('jwt'))
    @Post("create")
    create(@Body() createPostDto: CreatePostDto, @Req() request: Request & { user?: any }) {
        if (!request.user) {
            throw new Error('User not found in request obed');
        }
        const userId = request.user["userId"]
        return this.postService.create(userId, createPostDto)
    }

    @Get()
    getAll(){
        return this.postService.getAll()
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete("delete/:id")
    delete(@Param("id", ParseIntPipe) postId : number, @Req() request: Request & { user?: any }) {
        if (!request.user) {
            throw new Error('User not found in request obed');
        }
        const userId = request.user["userId"]
        return this.postService.delete(postId, userId)
    }

    @UseGuards(AuthGuard('jwt'))
    @Put("update/:id")
    update(@Param("id", ParseIntPipe) postId : number, @Body() updatePostDto : UpdatePostDto, @Req() request: Request & { user?: any }) {
        if (!request.user) {
            throw new Error('User not found in request obed');
        }
        const userId = request.user["userId"]
        return this.postService.update(postId, userId, updatePostDto)
    }
}
