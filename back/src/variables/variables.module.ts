import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VariablesController } from './variables.controller';
import { VariablesService } from './variables.service';
import { VariablesSeedService } from './variables-seed.service';
import { 
  CarSegment,
  CarStatus,
  YolYardim,
  OzelCekici,
  OzelCekiciSehir,
  TopluCekiciSehir,
  TopluCekiciKmFiyat,
  TopluCekici
} from './variables.entity';
import { JwtAuthModule } from '../auth/jwt.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CarSegment,
      CarStatus,
      YolYardim,
      OzelCekici,
      OzelCekiciSehir,
      TopluCekiciSehir,
      TopluCekiciKmFiyat,
      TopluCekici
    ]),
    JwtAuthModule
  ],
  controllers: [VariablesController],
  providers: [VariablesService, VariablesSeedService],
  exports: [VariablesService, VariablesSeedService]
})
export class VariablesModule implements OnModuleInit {
  constructor(private readonly variablesSeedService: VariablesSeedService) {}

  async onModuleInit() {
    try {
      console.log('Running variables seed...');
      await this.variablesSeedService.seed();
      console.log('Variables seed completed successfully');
    } catch (error) {
      console.error('Error running variables seed:', error);
    }
  }
} 