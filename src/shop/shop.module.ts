import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Product } from './entities/product.entity';
import { Order } from './entities/order.entity';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Product, Order])],
  providers: [ShopService],
  controllers: [ShopController],
  exports: [ShopService],
})
export class ShopModule {}