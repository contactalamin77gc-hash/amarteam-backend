import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, ParseUUIDPipe,
} from '@nestjs/common';
import { ShopService } from './shop.service';
import {
  CreateCategoryDto, UpdateCategoryDto,
  CreateProductDto, UpdateProductDto,
  CreateOrderDto, UpdateOrderDto,
} from './dto/shop.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums';
import { User } from '../users/entities/user.entity';
import { ForbiddenException } from '@nestjs/common';


@Controller('shop')
export class ShopController {
  constructor(private shopService: ShopService) {}

  // ══════════ CATEGORIES ══════════

  @Get('categories')
  @Public()
  getCategories() {
    return this.shopService.findAllCategories(true);
  }

  @Get('categories/admin')
  @Roles(Role.ADMIN)
  getCategoriesAdmin() {
    return this.shopService.findAllCategories(false);
  }

  @Post('categories')
  @Roles(Role.ADMIN)
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.shopService.createCategory(dto);
  }

  @Patch('categories/:id')
  @Roles(Role.ADMIN)
  updateCategory(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCategoryDto) {
    return this.shopService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @Roles(Role.ADMIN)
  removeCategory(@Param('id', ParseUUIDPipe) id: string) {
    return this.shopService.removeCategory(id);
  }

  // ══════════ ORDERS (before /products/:id) ══════════

  @Post('orders')
  createOrder(@CurrentUser() user: User, @Body() dto: CreateOrderDto) {
    return this.shopService.createOrder(user.id, dto);
  }

  @Get('orders/my')
  getMyOrders(@CurrentUser() user: User) {
    return this.shopService.findMyOrders(user.id);
  }

  @Get('orders/all')
  @Roles(Role.ADMIN)
  getAllOrders(@Query('status') status?: string) {
    return this.shopService.findAllOrders(status);
  }

  @Get('orders/:id')
async getOrder(
  @Param('id', ParseUUIDPipe) id: string,
  @CurrentUser() user: User,
) {
  const order = await this.shopService.findOneOrder(id);
  if (user.role !== Role.ADMIN && order.customerId !== user.id) {
    throw new ForbiddenException('You do not have access to this order');
  }
  return order;
}

  @Patch('orders/:id')
  @Roles(Role.ADMIN)
  updateOrder(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateOrderDto) {
    return this.shopService.updateOrder(id, dto);
  }

  @Delete('orders/:id')
  @Roles(Role.ADMIN)
  removeOrder(@Param('id', ParseUUIDPipe) id: string) {
    return this.shopService.removeOrder(id);
  }

  // ══════════ STATS ══════════

  @Get('stats')
  @Roles(Role.ADMIN)
  getStats() {
    return this.shopService.getStats();
  }

  // ══════════ PRODUCTS ══════════

  @Get('products')
  @Public()
  getProducts(
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
    @Query('featured') featured?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('inStock') inStock?: string,
  ) {
    return this.shopService.findAllProducts({
      categoryId, search, sort, featured, minPrice, maxPrice, inStock,
      activeOnly: true,
    });
  }

  @Get('products/admin')
  @Roles(Role.ADMIN)
  getProductsAdmin(
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
  ) {
    return this.shopService.findAllProducts({ categoryId, search, sort, activeOnly: false });
  }

  @Post('products')
  @Roles(Role.ADMIN)
  createProduct(@Body() dto: CreateProductDto) {
    return this.shopService.createProduct(dto);
  }

  @Patch('products/:id/toggle-active')
  @Roles(Role.ADMIN)
  toggleActive(@Param('id', ParseUUIDPipe) id: string) {
    return this.shopService.toggleProductActive(id);
  }

  @Patch('products/:id/toggle-featured')
  @Roles(Role.ADMIN)
  toggleFeatured(@Param('id', ParseUUIDPipe) id: string) {
    return this.shopService.toggleProductFeatured(id);
  }

  @Patch('products/:id')
  @Roles(Role.ADMIN)
  updateProduct(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductDto) {
    return this.shopService.updateProduct(id, dto);
  }

  @Delete('products/:id')
  @Roles(Role.ADMIN)
  removeProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.shopService.removeProduct(id);
  }

  @Get('products/:id')
  @Public()
  getProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.shopService.findOneProduct(id);
  }
}