import { Controller, Get, Post, Body, Param, Delete, Patch, UseGuards } from '@nestjs/common';
import { VariablesService } from './variables.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
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

@Controller('variables')
@UseGuards(JwtAuthGuard)
export class VariablesController {
  constructor(private readonly variablesService: VariablesService) {}

  // Segment Katsayıları
  @Get('segment-katsayilari')
  async findAllSegmentKatsayilari() {
    return await this.variablesService.findAllSegmentKatsayilari();
  }

  @Post('segment-katsayilari')
  async createSegmentKatsayilari(@Body() createDto: Partial<SegmentKatsayilari>) {
    return await this.variablesService.createSegmentKatsayilari(createDto);
  }

  @Patch('segment-katsayilari/:id')
  async updateSegmentKatsayilari(@Param('id') id: string, @Body() updateDto: Partial<SegmentKatsayilari>) {
    return await this.variablesService.updateSegmentKatsayilari(+id, updateDto);
  }

  @Delete('segment-katsayilari/:id')
  async removeSegmentKatsayilari(@Param('id') id: string) {
    return await this.variablesService.removeSegmentKatsayilari(+id);
  }

  // Merkez Konum
  @Get('merkez-konum')
  async getMerkezKonum() {
    return await this.variablesService.getMerkezKonum();
  }

  @Patch('merkez-konum')
  async updateMerkezKonum(@Body() updateDto: Partial<MerkezKonum>) {
    return await this.variablesService.updateMerkezKonum(updateDto);
  }

  // Araç Durumu
  @Get('arac-durumu')
  async findAllAracDurumu() {
    return await this.variablesService.findAllAracDurumu();
  }

  @Post('arac-durumu')
  async createAracDurumu(@Body() createDto: Partial<AracDurumu>) {
    return await this.variablesService.createAracDurumu(createDto);
  }

  @Patch('arac-durumu/:id')
  async updateAracDurumu(@Param('id') id: string, @Body() updateDto: Partial<AracDurumu>) {
    return await this.variablesService.updateAracDurumu(+id, updateDto);
  }

  @Delete('arac-durumu/:id')
  async removeAracDurumu(@Param('id') id: string) {
    return await this.variablesService.removeAracDurumu(+id);
  }

  // Otopark Konumları
  @Get('otopark-konumlari')
  async findAllOtoparkKonumlari() {
    return await this.variablesService.findAllOtoparkKonumlari();
  }

  @Post('otopark-konumlari')
  async createOtoparkKonumlari(@Body() createDto: Partial<OtoparkKonumlari>) {
    return await this.variablesService.createOtoparkKonumlari(createDto);
  }

  @Patch('otopark-konumlari/:id')
  async updateOtoparkKonumlari(@Param('id') id: string, @Body() updateDto: Partial<OtoparkKonumlari>) {
    return await this.variablesService.updateOtoparkKonumlari(+id, updateDto);
  }

  @Delete('otopark-konumlari/:id')
  async removeOtoparkKonumlari(@Param('id') id: string) {
    return await this.variablesService.removeOtoparkKonumlari(+id);
  }

  // KM Ücretleri
  @Get('km-ucretleri')
  async findAllKmUcretleri() {
    return await this.variablesService.findAllKmUcretleri();
  }

  @Post('km-ucretleri')
  async createKmUcretleri(@Body() createDto: Partial<KmUcretleri>) {
    return await this.variablesService.createKmUcretleri(createDto);
  }

  @Patch('km-ucretleri/:id')
  async updateKmUcretleri(@Param('id') id: string, @Body() updateDto: Partial<KmUcretleri>) {
    return await this.variablesService.updateKmUcretleri(+id, updateDto);
  }

  @Delete('km-ucretleri/:id')
  async removeKmUcretleri(@Param('id') id: string) {
    return await this.variablesService.removeKmUcretleri(+id);
  }

  // Araç Adedi Çarpanı
  @Get('arac-adedi-carpani')
  async findAllAracAdediCarpani() {
    return await this.variablesService.findAllAracAdediCarpani();
  }

  @Post('arac-adedi-carpani')
  async createAracAdediCarpani(@Body() createDto: Partial<AracAdediCarpani>) {
    return await this.variablesService.createAracAdediCarpani(createDto);
  }

  @Patch('arac-adedi-carpani/:id')
  async updateAracAdediCarpani(@Param('id') id: string, @Body() updateDto: Partial<AracAdediCarpani>) {
    return await this.variablesService.updateAracAdediCarpani(+id, updateDto);
  }

  @Delete('arac-adedi-carpani/:id')
  async removeAracAdediCarpani(@Param('id') id: string) {
    return await this.variablesService.removeAracAdediCarpani(+id);
  }

  // İl Özel Çekici Ücretleri
  @Get('il-ozel-cekici-ucretleri')
  async findAllIlOzelCekiciUcretleri() {
    return await this.variablesService.findAllIlOzelCekiciUcretleri();
  }

  @Post('il-ozel-cekici-ucretleri')
  async createIlOzelCekiciUcretleri(@Body() createDto: Partial<IlOzelCekiciUcretleri>) {
    return await this.variablesService.createIlOzelCekiciUcretleri(createDto);
  }

  @Patch('il-ozel-cekici-ucretleri/:id')
  async updateIlOzelCekiciUcretleri(@Param('id') id: string, @Body() updateDto: Partial<IlOzelCekiciUcretleri>) {
    return await this.variablesService.updateIlOzelCekiciUcretleri(+id, updateDto);
  }

  @Delete('il-ozel-cekici-ucretleri/:id')
  async removeIlOzelCekiciUcretleri(@Param('id') id: string) {
    return await this.variablesService.removeIlOzelCekiciUcretleri(+id);
  }

  // Genel Ayarlar
  @Get('genel-ayarlar')
  async getGenelAyarlar() {
    return await this.variablesService.getGenelAyarlar();
  }

  @Patch('genel-ayarlar')
  async updateGenelAyarlar(@Body() updateDto: Partial<GenelAyarlar>) {
    return await this.variablesService.updateGenelAyarlar(updateDto);
  }
} 