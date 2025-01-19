import { Body, Controller,Post,Inject,Get, Param } from '@midwayjs/core';
import { CodeStoreService } from '../service/code_store.service';
import { CodeStore } from '../entity/code_store.entity';

@Controller('/codeStore')
export class CodeStoreController {
  @Inject()
  codeStoreService: CodeStoreService;
  
  @Post('/create')
  async create(@Body() body: CodeStore) {
    return this.codeStoreService.createCodeStore(body);
  }

  @Get('/list')
  async list() {
    return this.codeStoreService.getCodeStoreList();
  }

  @Post('/delete/:id')
  async delete(@Param('id') id: string) {
    return this.codeStoreService.deleteCodeStore(id);
  }

  @Post('/update/:id')
  async update(@Param('id') id: string, @Body() body: CodeStore) {
    return this.codeStoreService.updateCodeStore(id, body);  
  }
}

