import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VariablesController } from './variables.controller';
import { VariablesService } from './variables.service';
import { 
  SegmentKatsayilari,
  YolYardimDegerleri,
  TopluCekiciDegerleri,
  OtoparkKonum,
  AralikUcretleri,
  AracAdetCarpani,
  IlOzelCekiciUcretleri,
  IlExtraCekiciUcretleri,
} from './variables.entity';
import { JwtAuthModule } from '../auth/jwt.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SegmentKatsayilari,
      YolYardimDegerleri,
      TopluCekiciDegerleri,
      OtoparkKonum,
      AralikUcretleri,
      AracAdetCarpani,
      IlOzelCekiciUcretleri,
      IlExtraCekiciUcretleri,
    ]),
    JwtAuthModule
  ],
  controllers: [VariablesController],
  providers: [VariablesService],
})
export class VariablesModule {} 