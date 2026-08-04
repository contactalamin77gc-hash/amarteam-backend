import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Category } from './entities/category.entity';
import { Product } from './entities/product.entity';
import { Order } from './entities/order.entity';
import {
  CreateCategoryDto, UpdateCategoryDto,
  CreateProductDto, UpdateProductDto,
  CreateOrderDto, UpdateOrderDto,
} from './dto/shop.dto';
import { UploadService } from '../upload/upload.service';
import { OrderStatus } from '../common/enums';

@Injectable()
export class ShopService {
  constructor(
    @InjectRepository(Category) private catRepo: Repository<Category>,
    @InjectRepository(Product) private prodRepo: Repository<Product>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    private uploadService: UploadService,
  ) {}

  // ══════════ CATEGORIES ══════════

  async createCategory(dto: CreateCategoryDto): Promise<Category> {
    const existing = await this.catRepo.findOne({ where: { name: dto.name } });
    if (existing) throw new ConflictException('Category name already exists');
    const cat = this.catRepo.create(dto as any);
    return this.catRepo.save(cat) as any;
  }

  async findAllCategories(activeOnly = false): Promise<Category[]> {
    const qb = this.catRepo.createQueryBuilder('c').orderBy('c.sortOrder', 'ASC').addOrderBy('c.name', 'ASC');
    if (activeOnly) qb.andWhere('c.isActive = true');
    return qb.getMany();
  }

  async findOneCategory(id: string): Promise<Category> {
    const c = await this.catRepo.findOne({ where: { id } });
    if (!c) throw new NotFoundException('Category not found');
    return c;
  }

  async updateCategory(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const c = await this.findOneCategory(id);
    if (dto.image && c.imagePublicId) {
      await this.uploadService.delete(c.imagePublicId, 'image');
    }
    Object.assign(c, dto);
    return this.catRepo.save(c);
  }

  async removeCategory(id: string): Promise<void> {
    const c = await this.catRepo.findOne({ where: { id }, relations: ['products'] });
    if (!c) throw new NotFoundException('Category not found');
    if (c.products?.length > 0) {
      throw new BadRequestException(`Cannot delete — ${c.products.length} product(s) use this category. Move or delete them first.`);
    }
    if (c.imagePublicId) await this.uploadService.delete(c.imagePublicId, 'image');
    await this.catRepo.remove(c);
  }

  // ══════════ PRODUCTS ══════════

  async createProduct(dto: CreateProductDto): Promise<Product> {
    const p = this.prodRepo.create({
      ...dto,
      photos: (dto.photos as any) || [],
      variants: (dto.variants as any) || [],
    } as any);
    return this.prodRepo.save(p) as any;
  }

  async findAllProducts(query?: {
    categoryId?: string;
    search?: string;
    sort?: string;
    featured?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    activeOnly?: boolean;
  }): Promise<Product[]> {
    const qb = this.prodRepo.createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'category');

    if (query?.activeOnly) qb.andWhere('p.isActive = true');
    if (query?.categoryId) qb.andWhere('p.categoryId = :cid', { cid: query.categoryId });
    if (query?.featured === 'true') qb.andWhere('p.isFeatured = true');
    if (query?.inStock === 'true') qb.andWhere('p.stock > 0');
    if (query?.minPrice) qb.andWhere('p.price >= :min', { min: Number(query.minPrice) });
    if (query?.maxPrice) qb.andWhere('p.price <= :max', { max: Number(query.maxPrice) });
    if (query?.search) {
      qb.andWhere('(p.name ILIKE :q OR p.nameBn ILIKE :q OR p.brand ILIKE :q OR p.description ILIKE :q)',
        { q: `%${query.search}%` });
    }

    switch (query?.sort) {
      case 'price-low': qb.orderBy('p.price', 'ASC'); break;
      case 'price-high': qb.orderBy('p.price', 'DESC'); break;
      case 'popular': qb.orderBy('p.soldCount', 'DESC'); break;
      case 'name': qb.orderBy('p.name', 'ASC'); break;
      default: qb.orderBy('p.createdAt', 'DESC');
    }

    return qb.getMany();
  }

  async findOneProduct(id: string): Promise<Product> {
    const p = await this.prodRepo.findOne({ where: { id }, relations: ['category'] });
    if (!p) throw new NotFoundException('Product not found');
    return p;
  }

  async updateProduct(id: string, dto: UpdateProductDto): Promise<Product> {
    const p = await this.findOneProduct(id);
    Object.assign(p, dto);
    return this.prodRepo.save(p);
  }

  async toggleProductActive(id: string): Promise<Product> {
    const p = await this.findOneProduct(id);
    p.isActive = !p.isActive;
    return this.prodRepo.save(p);
  }

  async toggleProductFeatured(id: string): Promise<Product> {
    const p = await this.findOneProduct(id);
    p.isFeatured = !p.isFeatured;
    return this.prodRepo.save(p);
  }

  async removeProduct(id: string): Promise<void> {
    const p = await this.findOneProduct(id);
    for (const photo of p.photos || []) {
      await this.uploadService.delete(photo.publicId, 'image');
    }
    await this.prodRepo.remove(p);
  }

  // ══════════ ORDERS ══════════

  private generateOrderNo(): string {
    const d = new Date();
    const ymd = `${d.getFullYear().toString().slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `AT${ymd}${rand}`;
  }

  async createOrder(customerId: string, dto: CreateOrderDto): Promise<Order> {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    const productIds = dto.items.map(i => i.productId);
    const products = await this.prodRepo.find({ where: { id: In(productIds) } });

    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products not found');
    }

    const isDhaka = dto.district.toLowerCase() === 'dhaka';
    let subtotal = 0;
    let maxDelivery = 0;
    const items: any[] = [];

    for (const item of dto.items) {
      const product = products.find(p => p.id === item.productId)!;

      if (!product.isActive) {
        throw new BadRequestException(`"${product.name}" is no longer available`);
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(`"${product.name}" — only ${product.stock} left in stock`);
      }

      const lineSubtotal = product.price * item.quantity;
      subtotal += lineSubtotal;

      const delivery = isDhaka ? product.dhakaDeliveryCharge : product.outsideDeliveryCharge;
      if (delivery > maxDelivery) maxDelivery = delivery;

      items.push({
         productId: product.id,
        productName: product.name,
        photo: product.photos?.[0]?.url || '',
        price: product.price,
        quantity: item.quantity,
        variant: item.variant,
        subtotal: lineSubtotal,
      });
    }

    const order = this.orderRepo.create({
      orderNo: this.generateOrderNo(),
      customerId,
      items,
      subtotal,
      deliveryCharge: maxDelivery,
      total: subtotal + maxDelivery,
      recipientName: dto.recipientName,
      phone: dto.phone,
      district: dto.district,
      upazila: dto.upazila,
      address: dto.address,
      note: dto.note,
      paymentMethod: dto.paymentMethod || 'cashOnDelivery',
      status: OrderStatus.PENDING,
    } as any);

    const saved = await this.orderRepo.save(order) as any;

    // Decrement stock + increment sold
    for (const item of dto.items) {
      const product = products.find(p => p.id === item.productId)!;
      product.stock -= item.quantity;
      product.soldCount += item.quantity;
      await this.prodRepo.save(product);
    }

    return saved;
  }

  async findAllOrders(status?: string): Promise<Order[]> {
    const qb = this.orderRepo.createQueryBuilder('o')
      .leftJoinAndSelect('o.customer', 'customer')
      .orderBy('o.createdAt', 'DESC');
    if (status) qb.andWhere('o.status = :status', { status });
    return qb.getMany();
  }

  async findMyOrders(customerId: string): Promise<Order[]> {
    return this.orderRepo.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneOrder(id: string): Promise<Order> {
    const o = await this.orderRepo.findOne({ where: { id }, relations: ['customer'] });
    if (!o) throw new NotFoundException('Order not found');
    return o;
  }

  async updateOrder(id: string, dto: UpdateOrderDto): Promise<Order> {
    const o = await this.findOneOrder(id);

    // Restore stock if cancelling
    if (dto.status === OrderStatus.CANCELLED && o.status !== OrderStatus.CANCELLED) {
      for (const item of o.items) {
        const p = await this.prodRepo.findOne({ where: { id: item.productId } });
        if (p) {
          p.stock += item.quantity;
          p.soldCount = Math.max(0, p.soldCount - item.quantity);
          await this.prodRepo.save(p);
        }
      }
    }

    if (dto.status !== undefined) o.status = dto.status;
    if (dto.isPaid !== undefined) o.isPaid = dto.isPaid;
    if (dto.transactionId !== undefined) o.transactionId = dto.transactionId;
    if (dto.adminNote !== undefined) o.adminNote = dto.adminNote;

    return this.orderRepo.save(o);
  }

  async removeOrder(id: string): Promise<void> {
    const o = await this.findOneOrder(id);
    await this.orderRepo.remove(o);
  }

  // ══════════ STATS ══════════

  async getStats() {
    const [products, categories, orders] = await Promise.all([
      this.prodRepo.count(),
      this.catRepo.count(),
      this.orderRepo.find(),
    ]);

    const revenue = orders
      .filter(o => o.status === OrderStatus.DELIVERED)
      .reduce((sum, o) => sum + o.total, 0);

    const lowStock = await this.prodRepo.count({ where: { stock: In([0, 1, 2, 3, 4, 5]) } });

    return {
      products,
      categories,
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === OrderStatus.PENDING).length,
      onTheWay: orders.filter(o => o.status === OrderStatus.ON_THE_WAY).length,
      delivered: orders.filter(o => o.status === OrderStatus.DELIVERED).length,
      revenue,
      lowStock,
    };
  }
}