import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

@Injectable()
export class VariablesService {
  constructor(
    @InjectRepository(SegmentKatsayilari)
    private segmentKatsayilariRepository: Repository<SegmentKatsayilari>,
    @InjectRepository(MerkezKonum)
    private merkezKonumRepository: Repository<MerkezKonum>,
    @InjectRepository(AracDurumu)
    private aracDurumuRepository: Repository<AracDurumu>,
    @InjectRepository(OtoparkKonumlari)
    private otoparkKonumlariRepository: Repository<OtoparkKonumlari>,
    @InjectRepository(KmUcretleri)
    private kmUcretleriRepository: Repository<KmUcretleri>,
    @InjectRepository(AracAdediCarpani)
    private aracAdediCarpaniRepository: Repository<AracAdediCarpani>,
    @InjectRepository(IlOzelCekiciUcretleri)
    private ilOzelCekiciUcretleriRepository: Repository<IlOzelCekiciUcretleri>,
    @InjectRepository(GenelAyarlar)
    private genelAyarlarRepository: Repository<GenelAyarlar>,
  ) {}

  // Segment Katsayıları
  async findAllSegmentKatsayilari() {
    return await this.segmentKatsayilariRepository.find();
  }

  async createSegmentKatsayilari(createDto: Partial<SegmentKatsayilari>) {
    const segment = this.segmentKatsayilariRepository.create(createDto);
    return await this.segmentKatsayilariRepository.save(segment);
  }

  async updateSegmentKatsayilari(id: number, updateDto: Partial<SegmentKatsayilari>) {
    await this.segmentKatsayilariRepository.update(id, updateDto);
    return await this.segmentKatsayilariRepository.findOne({ where: { id } });
  }

  async removeSegmentKatsayilari(id: number) {
    await this.segmentKatsayilariRepository.delete(id);
  }

  // Merkez Konum
  async getMerkezKonum() {
    return await this.merkezKonumRepository.findOne({ where: { id: 1 } });
  }

  async updateMerkezKonum(updateDto: Partial<MerkezKonum>) {
    await this.merkezKonumRepository.update(1, updateDto);
    return await this.getMerkezKonum();
  }

  // Araç Durumu
  async findAllAracDurumu() {
    return await this.aracDurumuRepository.find();
  }

  async createAracDurumu(createDto: Partial<AracDurumu>) {
    const durum = this.aracDurumuRepository.create(createDto);
    return await this.aracDurumuRepository.save(durum);
  }

  async updateAracDurumu(id: number, updateDto: Partial<AracDurumu>) {
    await this.aracDurumuRepository.update(id, updateDto);
    return await this.aracDurumuRepository.findOne({ where: { id } });
  }

  async removeAracDurumu(id: number) {
    await this.aracDurumuRepository.delete(id);
  }

  // Otopark Konumları
  async findAllOtoparkKonumlari() {
    return await this.otoparkKonumlariRepository.find();
  }

  async createOtoparkKonumlari(createDto: Partial<OtoparkKonumlari>) {
    const konum = this.otoparkKonumlariRepository.create(createDto);
    return await this.otoparkKonumlariRepository.save(konum);
  }

  async updateOtoparkKonumlari(id: number, updateDto: Partial<OtoparkKonumlari>) {
    await this.otoparkKonumlariRepository.update(id, updateDto);
    return await this.otoparkKonumlariRepository.findOne({ where: { id } });
  }

  async removeOtoparkKonumlari(id: number) {
    await this.otoparkKonumlariRepository.delete(id);
  }

  // KM Ücretleri
  async findAllKmUcretleri() {
    return await this.kmUcretleriRepository.find();
  }

  async createKmUcretleri(createDto: Partial<KmUcretleri>) {
    const ucret = this.kmUcretleriRepository.create(createDto);
    return await this.kmUcretleriRepository.save(ucret);
  }

  async updateKmUcretleri(id: number, updateDto: Partial<KmUcretleri>) {
    await this.kmUcretleriRepository.update(id, updateDto);
    return await this.kmUcretleriRepository.findOne({ where: { id } });
  }

  async removeKmUcretleri(id: number) {
    await this.kmUcretleriRepository.delete(id);
  }

  // Araç Adedi Çarpanı
  async findAllAracAdediCarpani() {
    return await this.aracAdediCarpaniRepository.find();
  }

  async createAracAdediCarpani(createDto: Partial<AracAdediCarpani>) {
    const carpan = this.aracAdediCarpaniRepository.create(createDto);
    return await this.aracAdediCarpaniRepository.save(carpan);
  }

  async updateAracAdediCarpani(id: number, updateDto: Partial<AracAdediCarpani>) {
    await this.aracAdediCarpaniRepository.update(id, updateDto);
    return await this.aracAdediCarpaniRepository.findOne({ where: { id } });
  }

  async removeAracAdediCarpani(id: number) {
    await this.aracAdediCarpaniRepository.delete(id);
  }

  // İl Özel Çekici Ücretleri
  async findAllIlOzelCekiciUcretleri() {
    return await this.ilOzelCekiciUcretleriRepository.find();
  }

  async createIlOzelCekiciUcretleri(createDto: Partial<IlOzelCekiciUcretleri>) {
    const ucret = this.ilOzelCekiciUcretleriRepository.create(createDto);
    return await this.ilOzelCekiciUcretleriRepository.save(ucret);
  }

  async updateIlOzelCekiciUcretleri(id: number, updateDto: Partial<IlOzelCekiciUcretleri>) {
    await this.ilOzelCekiciUcretleriRepository.update(id, updateDto);
    return await this.ilOzelCekiciUcretleriRepository.findOne({ where: { id } });
  }

  async removeIlOzelCekiciUcretleri(id: number) {
    await this.ilOzelCekiciUcretleriRepository.delete(id);
  }

  // Genel Ayarlar
  async getGenelAyarlar() {
    return await this.genelAyarlarRepository.findOne({ where: { id: 1 } });
  }

  async updateGenelAyarlar(updateDto: Partial<GenelAyarlar>) {
    await this.genelAyarlarRepository.update(1, updateDto);
    return await this.getGenelAyarlar();
  }
} 