import { Module } from '@nestjs/common';
import { SearchController } from './search.admin.controller';
import { SearchService } from './search.admin.service';

@Module({
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
