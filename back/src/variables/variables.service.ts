import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { 
  YolYardimDegerleri,
  TopluCekiciDegerleri,
  OtoparkKonum,
  AralikUcretleri,
  AracAdetCarpani,
  IlOzelCekiciUcretleri,
  IlExtraCekiciUcretleri,
  SegmentKatsayilari,
  KmBasiUcret
} from './variables.entity';

@Injectable()
export class VariablesService {
  constructor(
    @InjectRepository(YolYardimDegerleri)
    private yolYardimDegerleriRepository: Repository<YolYardimDegerleri>,
    @InjectRepository(TopluCekiciDegerleri)
    private topluCekiciDegerleriRepository: Repository<TopluCekiciDegerleri>,
    @InjectRepository(OtoparkKonum)
    private otoparkKonumRepository: Repository<OtoparkKonum>,
    @InjectRepository(AralikUcretleri)
    private aralikUcretleriRepository: Repository<AralikUcretleri>,
    @InjectRepository(AracAdetCarpani)
    private aracAdetCarpaniRepository: Repository<AracAdetCarpani>,
    @InjectRepository(IlOzelCekiciUcretleri)
    private ilOzelCekiciUcretleriRepository: Repository<IlOzelCekiciUcretleri>,
    @InjectRepository(IlExtraCekiciUcretleri)
    private ilExtraCekiciUcretleriRepository: Repository<IlExtraCekiciUcretleri>,
    @InjectRepository(SegmentKatsayilari)
    private segmentKatsayilariRepository: Repository<SegmentKatsayilari>,
    @InjectRepository(KmBasiUcret)
    private kmBasiUcretleriRepository: Repository<KmBasiUcret>,
  ) {}



  private async yolYardimDegerleri() {
    const yolYardimDegerleri = await this.yolYardimDegerleriRepository.findOne({ where: { id: 1 } });
    if (!yolYardimDegerleri && !yolYardimDegerleri.segmentKatsayilari) {

      const newYolYardimDegerleri = new YolYardimDegerleri();
      newYolYardimDegerleri.id = 1;
      newYolYardimDegerleri.baseUcret = 0;
      newYolYardimDegerleri.kmBasiUcret = 0;
      newYolYardimDegerleri.segmentKatsayilari = []; // önemli!
      await this.yolYardimDegerleriRepository.save(newYolYardimDegerleri);
      // segment katsayilari
      // sedan, hatcback, coupe , cabrio, suv, minivan, motorsiklet, station wagon, pickup, ticari
      // 1, 1, 1, 1, 1, 1, 1, 1, 1, 1

      let segmentKatsayilari = [
        { segment: 'sedan', katsayi: 1 },
        { segment: 'hactback', katsayi: 1 },
        { segment: 'coupe', katsayi: 1 },
        { segment: 'cabrio', katsayi: 1 },
        { segment: 'suv', katsayi: 1 },
        { segment: 'minivan', katsayi: 1 },
        { segment: 'motorsiklet', katsayi: 1 },
        { segment: 'station wagon', katsayi: 1 },
        { segment: 'pickup', katsayi: 1 },
        { segment: 'ticari', katsayi: 1 },
      ];

      for (let segmentKatsayilari2 of segmentKatsayilari) {
        const newSegmentKatsayilari = new SegmentKatsayilari();
        newSegmentKatsayilari.segment = segmentKatsayilari2.segment;
        newSegmentKatsayilari.katsayi = segmentKatsayilari2.katsayi;
        newSegmentKatsayilari.yolYardimDegerleri = newYolYardimDegerleri;
        await this.segmentKatsayilariRepository.save(newSegmentKatsayilari);
      }
    }

  }

  private async setupTopluCekiciDegerleri() {
    const topluCekiciDegerleri = await this.topluCekiciDegerleriRepository.findOne({ where: { id: 1 } });
    if (!topluCekiciDegerleri) {
      const newTopluCekiciDegerleri = new TopluCekiciDegerleri();
      newTopluCekiciDegerleri.baseUcret = 0;
      await this.topluCekiciDegerleriRepository.save(newTopluCekiciDegerleri);


      let segmentKatsayilari = [
        { segment: 'sedan', katsayi: 1 },
        { segment: 'hactback', katsayi: 1 },
        { segment: 'coupe', katsayi: 1 },
        { segment: 'cabrio', katsayi: 1 },
        { segment: 'suv', katsayi: 1 },
        { segment: 'minivan', katsayi: 1 },
        { segment: 'motorsiklet', katsayi: 1 },
        { segment: 'station wagon', katsayi: 1 },
        { segment: 'pickup', katsayi: 1 },
        { segment: 'ticari', katsayi: 1 },
      ];

      for (let segmentKatsayilari2 of segmentKatsayilari) {
        const newSegmentKatsayilari = new SegmentKatsayilari();
        newSegmentKatsayilari.segment = segmentKatsayilari2.segment;
        newSegmentKatsayilari.katsayi = segmentKatsayilari2.katsayi;
        newSegmentKatsayilari.topluCekiciDegerleri = newTopluCekiciDegerleri;
        await this.segmentKatsayilariRepository.save(newSegmentKatsayilari);
      }

      let ilOzelCekiciUcretleri = [
        { il: 'ankara', price: 0 },
        { il: 'istanbul', price: 0 },
        { il: 'izmir', price: 0 },
        { il: 'bursa', price: 0 },
        { il: 'adana', price: 0 },
      ];

      let ilExtraCekiciUcretleri = [
        { il: 'ankara', price: 0 },
        { il: 'istanbul', price: 0 },
        { il: 'izmir', price: 0 },
        { il: 'bursa', price: 0 },
        { il: 'adana', price: 0 },
      ];
      let kmBasiUcretleri = [
        { il: 'ankara', price: 0 },
        { il: 'istanbul', price: 0 },
        { il: 'izmir', price: 0 },
        { il: 'bursa', price: 0 },
        { il: 'adana', price: 0 },
      ];

      for (let ilOzelCekiciUcretleri2 of ilOzelCekiciUcretleri) {
        const newIlOzelCekiciUcretleri = new IlOzelCekiciUcretleri();
        newIlOzelCekiciUcretleri.il = ilOzelCekiciUcretleri2.il;
        newIlOzelCekiciUcretleri.price = ilOzelCekiciUcretleri2.price;
        newIlOzelCekiciUcretleri.topluCekiciDegerleri = newTopluCekiciDegerleri;
        await this.ilOzelCekiciUcretleriRepository.save(newIlOzelCekiciUcretleri);
      }

      for (let ilExtraCekiciUcretleri2 of ilExtraCekiciUcretleri) {
        const newIlExtraCekiciUcretleri = new IlExtraCekiciUcretleri();
        newIlExtraCekiciUcretleri.il = ilExtraCekiciUcretleri2.il;
        newIlExtraCekiciUcretleri.price = ilExtraCekiciUcretleri2.price;
        newIlExtraCekiciUcretleri.topluCekiciDegerleri = newTopluCekiciDegerleri;
        await this.ilExtraCekiciUcretleriRepository.save(newIlExtraCekiciUcretleri);
      }

      for (let kmBasiUcretleri2 of kmBasiUcretleri) {
        const newKmBasiUcretleri = new KmBasiUcret();
        newKmBasiUcretleri.il = kmBasiUcretleri2.il;
        newKmBasiUcretleri.price = kmBasiUcretleri2.price;
        newKmBasiUcretleri. = newKmBasiUcretleri;
        await this.kmBasiUcretleriRepository.save(newKmBasiUcretleri);
      } 
    }
  }

  private async setupOtoparkKonum() {
  }

  private async setupAralikUcretleri() {
  }

  private async setupAracAdediCarpani() {
  }

  private async setupIlOzelCekiciUcretleri() {
  }

  private async setupIlExtraCekiciUcretleri() {
  }

  private async setupAracDurumu() {
  }

  private async setupSegmentKatsayilari() {
  }

  private async setupMerkezKonum() {
  }

  // km ucretleri
  private async setupKmUcretleri() {
  }

  
  
  
} 