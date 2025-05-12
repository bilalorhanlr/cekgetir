import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, PrimaryColumn, OneToMany, OneToOne, JoinColumn, ManyToOne } from 'typeorm';




// Ortak Değerler , Yol Yardım Değişkenleri, Toplu Çekici Değişkenler
@Entity('segment_katsayilari')
export class SegmentKatsayilari {
  @PrimaryColumn()
  segment: string;

  @Column('decimal', { precision: 10, scale: 2 })
  katsayi: number;

  @ManyToOne(() => YolYardimDegerleri, (yolYardimDegerleri) => yolYardimDegerleri.segmentKatsayilari)
  @JoinColumn()
  yolYardimDegerleri: YolYardimDegerleri;

  @ManyToOne(() => TopluCekiciDegerleri, (topluCekiciDegerleri) => topluCekiciDegerleri.segmentKatsayilari)
  @JoinColumn()
  topluCekiciDegerleri: TopluCekiciDegerleri;
}

// Özel Çekici Değişkenleri
// base ücret
// km basi ücret 81 il
// arac durumu
// köprü geçiş ücreti
@Entity("arac_durumu")
export class AracDurumu {
  @PrimaryColumn()
  durum: string;

  @Column()
  price: number;

  @ManyToOne(() => OzelCekiciDegerleri, (ozelCekiciDegerleri) => ozelCekiciDegerleri.aracDurumu)
  @JoinColumn()
  ozelCekiciDegerleri: OzelCekiciDegerleri;

  // yol yardim degerleri
  @ManyToOne(() => YolYardimDegerleri, (yolYardimDegerleri) => yolYardimDegerleri.aracDurumu)
  @JoinColumn()
  yolYardimDegerleri: YolYardimDegerleri;

  // toplu cekici degerleri
  @ManyToOne(() => TopluCekiciDegerleri, (topluCekiciDegerleri) => topluCekiciDegerleri.aracDurumu)
  @JoinColumn()
  topluCekiciDegerleri: TopluCekiciDegerleri;

}


@Entity("km_basucret")
export class KmBasiUcret {
  @PrimaryColumn()
  il: string;

  @Column()
  price: number;

  @ManyToOne(() => OzelCekiciDegerleri, (ozelCekiciDegerleri) => ozelCekiciDegerleri.kmBasiUcretleri)
  @JoinColumn()
  ozelCekiciDegerleri: OzelCekiciDegerleri;

  
}

@Entity('il_ozel_cekici_ucretleri')
export class IlOzelCekiciUcretleri {
  @PrimaryColumn()
  il: string;

  @Column()
  price: number;

  @ManyToOne(() => TopluCekiciDegerleri, (topluCekiciDegerleri) => topluCekiciDegerleri.ilOzelCekiciUcretleri)
  @JoinColumn()
  topluCekiciDegerleri: TopluCekiciDegerleri;

}

@Entity('il_extra_cekici_ucretleri')
export class IlExtraCekiciUcretleri {
  @PrimaryColumn()
  il: string;

  @Column()
  price: number;

  @ManyToOne(() => TopluCekiciDegerleri, (topluCekiciDegerleri) => topluCekiciDegerleri.ilExtraCekiciUcretleri)
  @JoinColumn()
  topluCekiciDegerleri: TopluCekiciDegerleri;
}


@Entity("arac_adet_carpani")
export class AracAdetCarpani {
  @PrimaryColumn()
  carCount: number;
  
  @Column('decimal', { precision: 10, scale: 2 })
  carPrice: number;

  @ManyToOne(() => TopluCekiciDegerleri, (topluCekiciDegerleri) => topluCekiciDegerleri.aracAdetCarpani)
  @JoinColumn()
  topluCekiciDegerleri: TopluCekiciDegerleri;


}

@Entity("ozel_cekici_degerleri")
export class OzelCekiciDegerleri {
  @Column()
  baseUcret: number;

  @OneToMany(() => KmBasiUcret, (kmBasiUcret) => kmBasiUcret.il, { cascade: true })
  kmBasiUcretleri: KmBasiUcret[];

  @Column()
  kopruGecisUcreti: number;

  @OneToMany(() => SegmentKatsayilari, (segmentKatsayilari) => segmentKatsayilari.segment , { cascade: true })
  segmentKatsayilari: SegmentKatsayilari[];

  @OneToMany(() => AracDurumu, (aracDurumu) => aracDurumu.ozelCekiciDegerleri , { cascade: true })
  aracDurumu: AracDurumu[];

}

// Yol Yardım Değişkenleri
// segment katsayilari
// merkez konum
// base ucret
// km basi ucret
// aracın durumu

@Entity('yol_yardim_degerleri')
export class YolYardimDegerleri {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => SegmentKatsayilari, (segmentKatsayilari) => segmentKatsayilari.yolYardimDegerleri , { cascade: true })
  segmentKatsayilari: SegmentKatsayilari[];

  @Column()
  baseUcret: number;

  @Column()
  kmBasiUcret: number;

  @OneToMany(() => AracDurumu, (aracDurumu) => aracDurumu.yolYardimDegerleri , { cascade: true })
  aracDurumu: AracDurumu[];
  
  @Column('decimal', { precision: 10, scale: 8 })
  lat: number;

  @Column('decimal', { precision: 10, scale: 8 })
  lng: number;

}

// 
@Entity('aralik_ucretleri')
export class AralikUcretleri {
  @PrimaryColumn()
  mesafe: number;

  @Column()
  ucret: number;

  @ManyToOne(() => TopluCekiciDegerleri, (topluCekiciDegerleri) => topluCekiciDegerleri.aralikUcretleri)
  @JoinColumn()
  topluCekiciDegerleri: TopluCekiciDegerleri;
}

@Entity('otopark_konum')
export class OtoparkKonum {
  @PrimaryColumn()
  il: string;

  @Column()
  lat: number;

  @Column()
  lng: number;

  @ManyToOne(() => TopluCekiciDegerleri, (topluCekiciDegerleri) => topluCekiciDegerleri.otoparkKonum)
  @JoinColumn()
  topluCekiciDegerleri: TopluCekiciDegerleri;
}
// Toplu Çekici Değişkenleri
// segment katsayilari
// otopark konum 81 il
// base ucret
// km aralikları km ucretleri
// arac durumu
// arac adedi carpani
// 81 il için özel çekici ucretleri
// 81 ile extra çarpan

@Entity('toplu_cekici_degerleri')
export class TopluCekiciDegerleri {

  @Column()
  baseUcret: number;

  @OneToMany(() => SegmentKatsayilari, (segmentKatsayilari) => segmentKatsayilari.segment , { cascade: true })
  segmentKatsayilari: SegmentKatsayilari[];

  @OneToMany(() => IlOzelCekiciUcretleri, (ilOzelCekiciUcretleri) => ilOzelCekiciUcretleri.topluCekiciDegerleri , { cascade: true })
  ilOzelCekiciUcretleri: IlOzelCekiciUcretleri[];

  @OneToMany(() => IlExtraCekiciUcretleri, (ilExtraCekiciUcretleri) => ilExtraCekiciUcretleri.topluCekiciDegerleri , { cascade: true })
  ilExtraCekiciUcretleri: IlExtraCekiciUcretleri[];

  @OneToMany(() => AracAdetCarpani, (aracAdetCarpani) => aracAdetCarpani.topluCekiciDegerleri , { cascade: true })
  aracAdetCarpani: AracAdetCarpani[];

  @OneToMany(() => AracDurumu, (aracDurumu) => aracDurumu.topluCekiciDegerleri , { cascade: true })
  aracDurumu: AracDurumu[];

  @OneToMany(() => AralikUcretleri, (aralikUcretleri) => aralikUcretleri.topluCekiciDegerleri , { cascade: true })
  aralikUcretleri: AralikUcretleri[];

  @OneToMany(() => OtoparkKonum, (otoparkKonum) => otoparkKonum.topluCekiciDegerleri , { cascade: true })
  otoparkKonum: OtoparkKonum[];
}






