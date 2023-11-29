import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository  } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { FindRoleDto } from './dto/find-role.dto';
import { FindRoleAuthorizeDto } from './dto/find-roleAuthorize.dto';
import { UpdateRoleAuthorizeDto } from './dto/update-roleAuthorize.dto';
import { Role } from './entities/role.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository:Repository<Role>
  ){}

  create(createRoleDto: CreateRoleDto) {
    return 'This action adds a new role';
  }

  findAll(findRoleDto: FindRoleDto) {
    return `This action returns all role`;
  }

  findOne(id: number) {
    return `This action returns a #${id} role`;
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return `This action updates a #${id} role`;
  }

  remove(id: number) {
    return `This action removes a #${id} role`;
  }

  // 权限
  async findAllAuthorize(findRoleAuthorizeDto: FindRoleAuthorizeDto) {

  }

  async updateAuthorize(updateRoleAuthorizeDto: UpdateRoleAuthorizeDto) {

  }
}
