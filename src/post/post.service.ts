import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/createPostDto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdatePostDto } from './dto/updatePostDto';

@Injectable()
export class PostService {
    
    constructor(private readonly prismaService: PrismaService) {}

    async create(userId: any, createPostDto: CreatePostDto) {
        const { title, body } = createPostDto;
        await this.prismaService.post.create({
            data: {
                title,
                body,
                userId,
            },
        });
        return { data: 'Post successfully created' }; 
    }

    async getAll() {
        return await this.prismaService.post.findMany({
            include: {
                user : {
                    select : {
                        username : true,
                        email : true,
                        password : false
                    },
                },
                comment : {
                    include : {
                        user : {
                            select : {
                                username : true,
                                email : true,
                                password : false
                            }
                        }
                    }
                }
            }
        });
    }

    async delete(postId: number, userId : number) {
        // Vérifier si le post existe
            const post = await this.prismaService.post.findUnique({
                where: { postId },
            });
            if (!post) {
                throw new NotFoundException('Le post n\'existe pas');
            }

        // Vérifier si l'utilisateur est le propriétaire du post
            if (post.userId !== userId) {
                throw new NotFoundException('Vous n\'êtes pas autorisé à supprimer ce post');
            }
        
        // Supprimer le post
            await this.prismaService.post.delete({
                where: { postId },
            });
        return { data: 'Post supprimer avec succès' };
    }

    async update(postId: number, userId: number, updatePostDto: UpdatePostDto) {
        const { title, body } = updatePostDto;
        // Vérifier si le post existe
            const post = await this.prismaService.post.findUnique({
                where: { postId },
            });
            if (!post) {
                throw new NotFoundException('Le post n\'existe pas');
            }

        // Vérifier si l'utilisateur est le propriétaire du post
            if (post.userId !== userId) {
                throw new NotFoundException('Vous n\'êtes pas autorisé à mettre à jour ce post');
            }

        // Mettre à jour le post
            await this.prismaService.post.update({
                where: { postId },
                data: { ...updatePostDto },
            });
        return { data: 'Post mis à jour avec succès' };
    }
}
