import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommentService } from 'src/comment/comment.service';
import { CreateCommentDto } from './dto/createCommentDto';

@Controller('comment')
export class CommentController {
    constructor(private readonly commentService: CommentService) {}
    
        @UseGuards(AuthGuard('jwt'))
        @Post("create")
        create(@Body() createCommentDto: CreateCommentDto, @Req() request: Request & { user?: any }) {
            if (!request.user) {
                throw new Error('User not found in request obed');
            }
            const userId = request.user["userId"]
            return this.commentService.create(userId, createCommentDto)
        }
}
