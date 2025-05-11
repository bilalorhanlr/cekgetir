import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VariablesController } from './variables.controller';
import { VariablesService } from './variables.service';
import { 
  SegmentKatsayilari,
  MerkezKonum,
  AracDurumu,
  OtoparkKonumlari,
  KmUcretleri,
  AracAdediCarpani,
  IlOzelCekiciUcretleri,
  GenelAyarlar
} from './variables.entity';
import { JwtAuthModule } from '../auth/jwt.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SegmentKatsayilari,
      MerkezKonum,
      AracDurumu,
      OtoparkKonumlari,
      KmUcretleri,
      AracAdediCarpani,
      IlOzelCekiciUcretleri,
      GenelAyarlar
    ]),
    JwtAuthModule
  ],
  controllers: [VariablesController],
  providers: [VariablesService],
})
export class VariablesModule {} 