import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from './order.entity';
import { BulkVehicle } from './bulk-vehicle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, BulkVehicle])],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {} 