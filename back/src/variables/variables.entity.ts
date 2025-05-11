import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, PrimaryColumn, OneToMany } from 'typeorm';


@Entity('ortak_degerler')
export class OrtakDegerler {
  @PrimaryColumn('text')
  carType: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  }

@Entity('variables')
export class Variables {
  @PrimaryGeneratedColumn()
  id: number;

  // Yol Yardım Değişkenleri
  @OneToMany(() => OrtakDegerler, (ortakDegerler) => ortakDegerler.carType , { cascade: false })
  ortakDegerler: OrtakDegerler[];

  @Column('json')
  merkezKonum: {
    lat: number;
    lng: number;
  };

  @Column('decimal', { precision: 10, scale: 2 })
  baseUcret: number;

  @Column('decimal', { precision: 10, scale: 2 })
  kmBasiUcret: number;

  @Column('json')
  aracDurumu: {
    [key: string]: number;
  };

  // Özel Çekici Değişkenleri
  @Column('decimal', { precision: 10, scale: 2 })
  kopruGecisUcreti: number;

  // Toplu Çekici Değişkenleri
  @Column('json')
  otoparkKonumlari: {
    [key: string]: {
      lat: number;
      lng: number;
    };
  };

  @Column('json')
  kmUcretleri: {
    '0-100': number;
    '100-200': number;
    '200-300': number;
    [key: string]: number;
  };

  @Column('json')
  aracAdediCarpani: {
    [key: string]: number;
  };

  @Column('json')
  ilOzelCekiciUcretleri: {
    [key: string]: number;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('segment_katsayilari')
export class SegmentKatsayilari {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  segment: string;

  @Column('text')
  katsayi: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('merkez_konum')
export class MerkezKonum {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  lat: string;

  @Column('text')
  lng: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('arac_durumu')
export class AracDurumu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  durum: string;

  @Column('text')
  katsayi: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('otopark_konumlari')
export class OtoparkKonumlari {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  il: string;

  @Column('text')
  lat: string;

  @Column('text')
  lng: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('km_ucretleri')
export class KmUcretleri {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  aralik: string;

  @Column('text')
  ucret: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('arac_adedi_carpani')
export class AracAdediCarpani {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  adet: string;

  @Column('text')
  carpan: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('il_ozel_cekici_ucretleri')
export class IlOzelCekiciUcretleri {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  il: string;

  @Column('text')
  ucret: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('genel_ayarlar')
export class GenelAyarlar {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  baseUcret: string;

  @Column('text')
  kmBasiUcret: string;

  @Column('text')
  kopruGecisUcreti: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 